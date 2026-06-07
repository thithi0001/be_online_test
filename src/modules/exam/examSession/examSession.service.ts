import { Role } from "@/common/enums/role.enum";
import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { CreateExamSessionDto, UpdateExamSessionDto } from "./dto/examSession.dto";
import { QuerySessionDto } from "./dto/examSession-response.dto";
import { ExamTemplateService } from "../examTemplate/examTemplate.service";
import { NotificationService } from "@/modules/notification/notification.service";
import { SessionStatus } from "@/common/enums/statuses.enum";

@Injectable()
export class ExamSessionService {
    constructor(
        private prisma: PrismaService,
        private examTemplateService: ExamTemplateService,
        private notiService: NotificationService,
    ) {}

    async validateTeacherOwnership(
        teacherId: number,
        sessionId: number,
    ) {
        const existed = await this.prisma.exam_sessions.findFirst({
            where: {
                created_by: teacherId,
                session_id: sessionId,
            },
            select: {
                session_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý hoặc kỳ thi không tồn tại.');
    }

    async validateAndReturnForTeacher(
        teacherId: number,
        sessionId: number,
    ) {
        const existed = await this.prisma.exam_sessions.findFirst({
            where: {
                created_by: teacherId,
                session_id: sessionId,
            },
            include: {
                exam_session_class: {
                    select: { classes: { omit: { teacher_id: true },},},
                },
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý hoặc kỳ thi không tồn tại.');

        return existed;
    }

    async validateStudentOwnership(
        studentId: number,
        sessionId: number,
    ) {
        const existed = await this.prisma.exam_sessions.findFirst({
            where: {
                session_id: sessionId,
                exam_session_class: { some: { classes: { 
                    student_class: { some: { student_id: studentId },},},},
                },
            },
            select: {
                session_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền tham gia hoặc kỳ thi không tồn tại.');
    }

    private selectForStudent = {
        session_id: true,
        template_id: true,
        session_name: true,
        duration: true,
        start_time: true,
        end_time: true,
        attempt_limit: true,
        session_status: true,
        created_by: true,
    };

    async validateAndReturnForStudent(
        studentId: number,
        sessionId: number,
    ) {
        const existed = await this.prisma.exam_sessions.findFirst({
            where: {
                session_id: sessionId,
                exam_session_class: { some: { classes: { 
                    student_class: { some: { student_id: studentId },},},},
                },
            },
            select: this.selectForStudent,
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền tham gia kỳ thi.');
    
        return existed;
    }

    async validateSessionTime(
        session: any
    ) {
        const now = Date.now();

        if (
            now < session.start_time.getTime() ||
            now > session.end_time.getTime()
        ) {
            throw new BadRequestException(
                'Ngoài thời gian cho phép làm bài.',
            );
        }
    }

    async validateSessionPassword(
        sessionId: number,
        sessionPassword: string,
    ) {
        const session =
            await this.prisma.exam_sessions.findUnique({
                where: {
                    session_id: sessionId,
                },
                select: {
                    session_password: true,
                },
            });

        if (
            sessionPassword !== session?.session_password
        ) {
            throw new BadRequestException(
                'Mật khẩu không đúng.',
            );
        }
    }

    async create(
        teacherId: number,
        dto: CreateExamSessionDto,
    ) {
        /**
         * không cho phép dùng đề thi không hợp lệ
         */
        await this.examTemplateService.validateTemplate(dto.templateId);

        const session = await this.prisma.exam_sessions.create({
            data: {
                template_id: dto.templateId,
                session_name: dto.sessionName,
                duration: dto.duration,
                shuffle_questions: dto.shuffleQuestions,
                shuffle_answers: dto.shuffleAnswers,
                auto_submit: dto.autoSubmit,
                allow_review: dto.allowReview,
                show_result: dto.showResult,
                start_time: dto.startTime,
                end_time: dto.endTime,
                attempt_limit: dto.attemptLimit,
                session_password: dto.sessionPassword,
                session_status: dto.sessionStatus,
                created_by: teacherId,
                
                exam_session_class: {
                    create: dto.classIds.map(id => ({
                        class_id: id,
                    })),
                },
            },
            include: {
                exam_session_class: {
                    select: { classes: { omit: { teacher_id: true },},},
                },
            },
        });

        if (session.session_status === SessionStatus.PUBLISHED) {
            const studentIds = await this.prisma.users.findMany({
                where: {
                    student_class: {
                        some: { class_id: { in: dto.classIds },},
                    },
                },
                select: { user_id: true },
            });

            await this.notiService.create(
                {
                    content: `Kỳ thi ${session.session_name} sẽ 
                        diễn ra từ ${session.start_time.toString()} 
                        đến ${session.end_time.toString()} .`,
                    createdBy: session.created_by,
                },
                studentIds.map(i => i.user_id),
            );
        }

        return session;
    }

    async update(
        teacherId: number,
        sessionId: number,
        dto: UpdateExamSessionDto,
    ) {
        const session = await this.validateAndReturnForTeacher(teacherId, sessionId);
        // không cho phép sửa khi không còn là nháp nữa
        if (session.session_status !== SessionStatus.DRAFT)
            throw new BadRequestException('Không được phép chỉnh sửa kỳ thi đã công bố.');
        
        // không cho phép dùng đề thi không hợp lệ
        if (!dto.templateId)
            await this.examTemplateService.validateTemplate(Number(dto.templateId));

        if (!dto.classIds)
            throw new BadRequestException('Chưa chọn lớp cho kỳ thi.');

        const updated = await this.prisma.exam_sessions.update({
            where: {
                session_id: sessionId,
            },
            data: {
                template_id: dto.templateId,
                session_name: dto.sessionName,
                duration: dto.duration,
                shuffle_questions: dto.shuffleQuestions,
                shuffle_answers: dto.shuffleAnswers,
                auto_submit: dto.autoSubmit,
                allow_review: dto.allowReview,
                show_result: dto.showResult,
                start_time: dto.startTime,
                end_time: dto.endTime,
                attempt_limit: dto.attemptLimit,
                session_password: dto.sessionPassword,
                session_status: dto.sessionStatus,
                
                exam_session_class: {
                    deleteMany: {},
                    create: dto.classIds.map(id => ({
                        class_id: id,
                    })),
                },
            },
            include: {
                exam_session_class: {
                    select: { classes: { omit: { teacher_id: true },},},
                },
            },
        });

        if (updated.session_status === SessionStatus.PUBLISHED) {
            const studentIds = await this.prisma.users.findMany({
                where: {
                    student_class: {
                        some: { class_id: { in: dto.classIds },},
                    },
                },
                select: { user_id: true },
            });

            await this.notiService.create(
                {
                    content: `Kỳ thi ${updated.session_name} sẽ 
                        diễn ra từ ${updated.start_time.toString()} 
                        đến ${updated.end_time.toString()} .`,
                    createdBy: updated.created_by,
                },
                studentIds.map(i => i.user_id),
            );
        }

        return updated;
    }

    async delete(
        teacherId: number,
        sessionId: number,
    ) {
        const session = await this.validateAndReturnForTeacher(teacherId, sessionId);
        // không cho phép xóa khi không còn là nháp nữa
        if (session.session_status !== 'draft')
            throw new BadRequestException('Không được phép chỉnh sửa kỳ thi đã công bố.');

        await this.prisma.$transaction([
            this.prisma.exam_session_class.deleteMany({
                where: {
                    session_id: sessionId,
                },
            }),

            this.prisma.exam_sessions.delete({
                where: {
                    session_id: sessionId,
                },
            }),
        ]);

        return {
            message: 'Đã xóa kỳ thi.',
        };
    }

    async getById(
        userId: number,
        role: Role,
        sessionId: number,
    ) {
        switch(role) {
            case Role.TEACHER:
                return await this.validateAndReturnForTeacher(userId, sessionId);

            case Role.STUDENT:
                return await this.validateAndReturnForStudent(userId, sessionId);

            default:
                return;
        }
    }

    async getMany(
        userId: number,
        role: Role,
        query: QuerySessionDto,
    ) {
        const {
            keyword, 
            page = 1, 
            limit = 10,
            createdBy,
            status,
            classId,
            startFrom, 
            startTo,
        } = query;

        let where = {};
        const include = {
            exam_session_class: {
                select: { classes: { omit: { teacher_id: true } } },
            },
        };

        const select = (role === Role.STUDENT) ? {
            ...this.selectForStudent,
            exam_session_class: include.exam_session_class,
        } : undefined;

        switch(role) {
            case Role.TEACHER:
                where = {
                    created_by: userId,
                    ...(keyword && { session_name: { contains: keyword } }),
                    ...(status && { session_status: status }),
                    ...(classId && { 
                        exam_session_class: { some: { class_id: classId } } 
                    }),
                    start_time: {
                        ...(startFrom && { gte: startFrom }),
                        ...(startTo && { lte: startTo }),
                    },
                };
                break;

            case Role.STUDENT: 
                where = {
                    ...(createdBy && { created_by: createdBy }),
                    ...(keyword && { session_name: { contains: keyword } }),
                    ...(status && { session_status: status }),
                    exam_session_class: { some: { classes: { 
                        student_class: { some: { student_id: userId } } } }
                    },
                    start_time: {
                        ...(startFrom && { gte: startFrom }),
                        ...(startTo && { lte: startTo }),
                    },
                };
                break;

            default:
                // get all
                where = {
                    ...(createdBy && { created_by: createdBy }),
                    ...(keyword && { session_name: { contains: keyword } }),
                    ...(status && { session_status: status }),
                    ...(classId && { 
                        exam_session_class: { some: { class_id: classId } } 
                    }),
                    start_time: {
                        ...(startFrom && { gte: startFrom }),
                        ...(startTo && { lte: startTo }),
                    },
                };
                break;
        }
        
        const [data, total] = await this.prisma.$transaction([
            this.prisma.exam_sessions.findMany({
                where,
                ...(select && { select }),
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [
                    { start_time: 'desc' },
                    { session_name: 'asc' },
                ],
                ...(select ? {} : {
                    omit: { session_password: true },
                    include,
                }),
            }),

            this.prisma.exam_sessions.count({ where }),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

}