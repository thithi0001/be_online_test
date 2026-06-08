import { Role } from "@/common/enums/role.enum";
import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateAttemptDto } from "./dto/attempt.dto";
import { QueryAttemptDto } from "./dto/attempt-response.dto";
import { ExamSessionService } from "../exam/examSession/examSession.service";
import { AttemptStatus, SessionStatus } from "@/common/enums/statuses.enum";
import { randomBytes } from "crypto";
import { ClassService } from "../class/class.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class AttemptService {
    constructor(
        private prisma: PrismaService,
        private examSessionService: ExamSessionService,
        private classService: ClassService,
        private notiService: NotificationService,
    ) {}
    
    async validateTeacherOwnership(
        teacherId: number,
        attemptId: number,
    ) {
        // xem lịch sử làm bài của sv tham gia kỳ thi do mình tổ chức
        /**
         * 1. xác định được kỳ thi từ bài làm
         * 2. xác định kỳ thi có phải do gv tạo
         */
        const existed = await this.prisma.student_attempts.findFirst({
            where: {
                attempt_id: attemptId,
                exam_sessions: {
                    created_by: teacherId,
                },
                attempt_status: { not: AttemptStatus.INPROGRESS },
            },
            select: {
                attempt_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('[vto] Không được phép xem hoặc bài làm không tồn tại.');
    }
    
    async validateStudentOwnership(
        studentId: number,
        attemptId: number,
    ) {
        const existed = await this.prisma.student_attempts.findFirst({
            where: {
                student_id: studentId,
                attempt_id: attemptId,
            },
            select: {
                attempt_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('[vso] Không được phép xem hoặc bài làm không tồn tại.');
    }

    async validateAttemptEligibility(
        studentId: number,
        sessionId: number,
        sessionPassword: string,
    ) {
        /**
         * đủ 6 điều kiện mới cho phép làm bài
        */

       // 1. sv phải đang ở trong lớp được tổ chức kỳ thi
        const session = await this.examSessionService
            .validateAndReturnForStudent(studentId, sessionId);
        
        // 2. kỳ thi đã được mở và đang còn mở
        await this.examSessionService
            .validateSessionTime(session);
        
        // 3. số lần làm bài trong giới hạn quy định
        // 4. hoặc sv được cho phép làm bài lại
        const { attempted, retake, reachedLimit } =
            await this.validateAttemptLimit(
                studentId,
                sessionId,
                session,
            );

        if (!!retake)
            await this.validateInRetakeTime(retake);

        if (reachedLimit)
            throw new BadRequestException(
                '[vae] Đã đạt giới hạn cho phép làm bài.',
            );

        // 5. sv đang không có tham gia làm bài thi nào
        await this.validateNoActiveAttempt(studentId);

        // 6. sv nhập đúng mật khẩu kỳ thi
        await this.examSessionService
            .validateSessionPassword(sessionId, sessionPassword);

        return { 
            attemptNo: attempted + 1, 
            isRetake: !!retake, 
        };
    }

    async validateInRetakeTime(
        retake: any
    ) {
        const now = Date.now();

        if (
            now < retake.available_from.getTime() ||
            now > retake.available_to.getTime()
        ) {
            throw new BadRequestException(
                '[virt] Ngoài thời gian cho phép làm bài.',
            );
        }
    }

    async validateAttemptLimit(
        studentId: number,
        sessionId: number,
        session: any,
    ) {
        const [attempted, retake] = await this.prisma.$transaction([
            this.prisma.student_attempts.count({
                where: {
                    student_id: studentId,
                    session_id: sessionId,
                },
            }),

            this.prisma.retake_permissions.findFirst({
                where: {
                    retake_requests: {
                        session_id: sessionId,
                        student_id: studentId,
                    },
                },
            }),
        ]);

        const maxAttempt = !!retake
            ? Number(retake.max_attempt)
            : Number(session.attempt_limit);

        const reachedLimit = attempted >= maxAttempt;

        return {
            attempted,
            retake,
            reachedLimit,
        };
    }

    async validateNoActiveAttempt(
        studentId: number,
    ) {
        const attempting =
            await this.prisma.student_attempts.findFirst({
                where: {
                    student_id: studentId,
                    attempt_status: AttemptStatus.INPROGRESS,
                },
            });

        if (attempting) {
            throw new BadRequestException(
                '[vnaa] Không được phép tham gia nhiều bài thi cùng lúc.',
            );
        }
    }

    async create(
        studentId: number,
        dto: CreateAttemptDto,
    ) {
        /**
         * xác định đây là lần làm bài thứ mấy
         * count = attempt.count({student_id, session_id})
         * attemptNo = count + 1
        */
        /**
         * nếu không có cho phép thi lại
         * số lần đã thi phải không nhỏ hơn số lần làm bài quy định của kỳ thi
         * nếu có cho phép thi lại
         * số lần đã thi phải nhỏ hơn số lần làm bài tối đa 
         */

        const { attemptNo, isRetake } = await this
            .validateAttemptEligibility(studentId, dto.sessionId, dto.sessionPassword);
        
        return await this.prisma.student_attempts.create({
            data: {
                student_id: studentId,
                session_id: dto.sessionId,
                ip_address: dto.ipAddress,
                device_info: dto.deviceInfo,
                attempt_no: attemptNo,
                is_retake: isRetake,
                shuffle_seed: randomBytes(16).toString('hex'),
            },
            omit: { total_score: true },
        });
    }
    
    async update(
        studentId: number,
        attemptId: number,
        // danh sách đã được lọc chứa lựa chọn mới
        newAnswerIds: number[],
        // danh sách chứa lựa chọn đã bị loại bỏ
        deleteAnswerIds: number[],
    ) {
        /**
         * ghi đáp án sinh viên đã chọn vào db
         * -> create student_attempt_answers
         */
        await this.validateStudentOwnership(studentId, attemptId);

        await this.prisma.$transaction(async tx => {
            await tx.student_attempt_answers.deleteMany({
                where: {
                    attempt_id: attemptId,
                    student_attempts: { attempt_status: AttemptStatus.INPROGRESS },
                    answer_id: { in: deleteAnswerIds },
                },
            });

            if (newAnswerIds.length) {
                await tx.student_attempt_answers.createMany({
                    data: newAnswerIds.map(id => ({
                        attempt_id: attemptId,
                        answer_id: id,
                    })),
                });
            }
        });

        return await this.getStudentAnswers(attemptId);
    }

    async submit(
        studentId: number,
        attemptId: number,
        status: AttemptStatus.SUBMITTED | AttemptStatus.TIMEOUT,
    ) {
        const attempt = await this.prisma.student_attempts.findUnique({
            where: {
                attempt_id: attemptId,
            },
        });

        if (!attempt)
            throw new NotFoundException('[s] Bài làm không tồn tại.');

        if (attempt.student_id !== studentId)
            throw new ForbiddenException('[s] Không có quyền nộp bài làm.');

        if (attempt.attempt_status !== AttemptStatus.INPROGRESS)
            throw new BadRequestException('[s] Bài làm đã được nộp.');

        const submited = await this.prisma.student_attempts.update({
            where: {
                attempt_id: attemptId,
            },
            data: {
                attempt_status: status,
                submit_time: new Date(),
            },
            omit: { total_score: true },
        });

        await this.notiService.create(
            {
                content: `Bài làm của bạn đã được nộp.`,
                createdBy: studentId,
            },
            [studentId],
        );

        await this.grade(submited.attempt_id);

        return submited;
    }

    /** 
     * có thể đơn giản hàm + tối ưu truy vấn bằng cách
     * thêm question_id vào student_attempt_answers
     * -> dư thừa có kiểm soát
     */ 
    async grade(
        attemptId: number,
    ) {
        // lấy đáp án sv đã chọn
        const selectedAnswers = await this.prisma.student_attempt_answers.findMany({
            where: {
                attempt_id: attemptId,
            },
            select: {
                answer_id: true,
                answer_banks: { select: { question_id: true,},},
            },
        });

        // lấy câu hỏi trong bài làm (không phải toàn bộ đề)
        const questionIds = [
            ...new Set(
                selectedAnswers.map(
                    i => i.answer_banks.question_id,
                ),
            ),
        ];

        // lấy đáp án, điểm của câu hỏi
        const questions = await this.prisma.question_banks.findMany({
            where: {
                question_id: { in: questionIds },
            },
            select: {
                question_id: true,
                q_type: true,
                
                answer_banks: {
                    select: {
                        answer_id: true,
                        is_correct: true,
                    },
                },

                exam_template_questions: { select: { score: true },},
            },
        });

        // gom đáp án của sv theo câu hỏi
        const selectedMap = new Map<number, Set<number>>();

        for (const row of selectedAnswers) {
            const questionId = row.answer_banks.question_id;

            if (!selectedMap.has(questionId)) {
                selectedMap.set(questionId, new Set());
            }

            selectedMap.get(questionId)!.add(row.answer_id);
        }

        let totalScore = 0.00;

        for (const question of questions) {
            // lấy toàn bộ đáp án của 1 câu hỏi sv chọn để xét
            const selectedIds = 
                selectedMap.get(question.question_id) ?? 
                new Set<number>;

            // lấy (các) đáp đúng của câu hỏi đó
            const correctIds = new Set(
                question.answer_banks
                    .filter(a => a.is_correct)
                    .map(a => a.answer_id),
            );

            let isCorrect = true;

            if (selectedIds.size !== correctIds.size) {
                // khác số lượng với đáp án đúng -> sai
                // dùng cho câu hỏi nhiều đáp án đúng
                isCorrect = false;
            } else {
                // xét từng đáp án nếu đã cùng số lượng
                // dùng cho cả câu hỏi 1 và nhiều đáp án đúng
                for (const answerId of correctIds) {
                    if (!selectedIds.has(answerId)) {
                        // nếu trong các câu hỏi đã chọn không có đáp án đúng
                        // trả về sai
                        isCorrect = false;
                        break;
                    }
                }
            }

            if (isCorrect) {
                totalScore += Number(
                    question.exam_template_questions[0].score,
                );
            }
        }

        const graded = await this.prisma.student_attempts.update({
            where: {
                attempt_id: attemptId,
            },
            data: {
                total_score: totalScore,
                attempt_status: AttemptStatus.GRADED,
            },
        });

        // return {
        //     ...graded,
        //     total_score: graded.total_score?.toString(),
        // }
    }

    // lấy lại bài đang làm
    async getCurrent(
        studentId: number,
    ) {
        const attempt = await this.prisma.student_attempts.findFirst({
            where: {
                student_id: studentId, 
                attempt_status: AttemptStatus.INPROGRESS,
            },
            omit: { total_score: true },
        });

        if (!attempt)
            return {
                message: 'Không có bài thi.',
            };

        const selectedAnswers = await this.getStudentAnswers(attempt.attempt_id);

        return {
            attempt,
            selectedAnswers,
        };
    }

    async getById(
        userId: number,
        role: Role,
        attemptId: number,
    ) {
        let data = await this.prisma.student_attempts.findUnique({
            where: {
                attempt_id: attemptId,
            },
            include: {
                exam_sessions: {
                    select: {
                        session_status: true,
                        allow_review: true,
                        show_result: true,
                        created_by: true,
                    },
                },
            },
        });

        if (!data)
            throw new NotFoundException('[gbid] Không tìm thấy bài làm.');
        
        switch (role) {
            case Role.ADMIN:
                break;

            case Role.TEACHER:                
                if (userId !== data.exam_sessions.created_by)
                    throw new ForbiddenException('[gbid] Không được phép xem hoặc bài làm không tồn tại.');
                break;
                
            case Role.STUDENT:
                if (userId !== data.student_id)
                    throw new ForbiddenException('[gbid] Không được phép xem hoặc bài làm không tồn tại.');
                break;

            default:
                break;
        }
                    
        /**
         * không trả về bài làm khi đã nộp bài (SUBMITTED | TIMEOUT)
         * và gv đặt allowReview = false
         */
        const denyReview = 
            (data.attempt_status === AttemptStatus.SUBMITTED
                || data.attempt_status === AttemptStatus.TIMEOUT
            ) && !data.exam_sessions.allow_review;
        
        if (denyReview)
            throw new BadRequestException('[gbid] Không cho phép xem bài làm.');

        /**
         * ẩn điểm đối với sv 
         * khi chưa được chấm (!GRADED)
         * hoặc (khi đã được chám nhưng đang diễn ra kỳ thi (!FINISHED)
         * và gv đặt showResult = false)
         */

        const canViewScore = 
            data.attempt_status === AttemptStatus.GRADED &&
            (
                data.exam_sessions.session_status === SessionStatus.FINISHED ||
                data.exam_sessions.show_result
            );

        const {
            exam_sessions,
            total_score,
            ...attemptData
        } = data ;

        const attempt = canViewScore ? 
            {...attemptData, total_score } : attemptData;

        const selectedAnswers = await this.getStudentAnswers(attemptId);

        return {
            attempt,
            selectedAnswers,
        };
    }
    
    async getMany(
        userId: number,
        role: Role,
        query: QueryAttemptDto,
    ) {
        const {
            page = 1,
            limit = 10,
            studentId,
            sessionId,
            isRetake,
            status,
            classId,
        } = query;

        let where = {};

        switch (role) {
            case Role.TEACHER:
                if (!!classId)
                    await this.classService.validateTeacherOwnerShip(userId, classId);

                where = {
                    ...(studentId && { student_id: studentId }),
                    ...(sessionId && { session_id: sessionId }),
                    ...(isRetake !== undefined && { is_retake: isRetake }),
                    ...(status && 
                        status !== AttemptStatus.INPROGRESS && 
                        { attempt_status: status }),
                    ...(classId && { users: { 
                        student_class: { some: {class_id: classId,},},
                    }}),
                };
                break;

            case Role.STUDENT:
                where = {                    
                    student_id: userId,
                    ...(sessionId && { session_id: sessionId }),
                    ...(isRetake !== undefined && { is_retake: isRetake }),
                    ...(status && 
                        status !== AttemptStatus.INPROGRESS && 
                        { attempt_status: status }),
                };
                break;

            default:
                break;
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.student_attempts.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    student_id: 'asc',
                },
            }),

            this.prisma.student_attempts.count({ where }),
        ]);

        return {
            data: data.map(i =>({
                ...i,
                total_score: i.total_score?.toString(),
            })),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getStudentAnswers(
        attemptId: number,
    ) {
        return await this.prisma.student_attempt_answers.findMany({
            where: {
                attempt_id: attemptId,
            },
            select: {
                answer_id: true,
            },
        });
    }
}