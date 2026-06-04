import { Role } from "@/common/enums/role.enum";
import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { CreateAttemptDto, CreateStudentAnswerDto } from "./dto/attempt.dto";
import { QueryAttemptDto } from "./dto/attempt-response.dto";
import { ExamSessionService } from "../exam/examSession/examSession.service";

@Injectable()
export class AttemptService {
    constructor(
        private prisma: PrismaService,
        private examSessionService: ExamSessionService,
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
            },
            select: {
                attempt_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không được phép xem bài làm.');
    }
    
    async validateStudentOwnership(
        studentId: number,
        attemptId: number
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
            throw new ForbiddenException('Không được phép xem bài làm.');
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
        const now = new Date().getTime();
        if (now < session.start_time.getTime() || 
            now > session.end_time.getTime() )
            throw new BadRequestException('Ngoài thời gian cho phép làm bài.');
        
        // 3. số lần làm bài trong giới hạn quy định
        // 4. hoặc sv được cho phép làm bài lại
        const [attempted, retake] = await this.prisma.$transaction([
            this.prisma.student_attempts.count({
                where: {
                    student_id: studentId,
                    session_id: sessionId,
                },
            }),

            this.prisma.retake_permissions.findUnique({
                where: {
                    session_id_student_id: {
                        session_id: sessionId,
                        student_id: studentId,
                    },
                },
            }),
        ]);

        if (!retake) {
            if (attempted >= Number(session.attempt_limit))
                throw new BadRequestException('Đã đạt giới hạn cho phép làm bài.');
        } else {
            if (attempted >= Number(retake.max_attempt))
                throw new BadRequestException('Đã đạt giới hạn cho phép làm bài.');
        }

        // 5. sv đang không có tham gia làm bài thi nào

        // 6. sv nhập đúng mật khẩu kỳ thi
        const password = await this.prisma.exam_sessions.findUnique({
            where: {
                session_id: sessionId
            },
            select: {
                session_password: true,
            },
        });
        if (sessionPassword !== String(password))
            throw new BadRequestException('Mật khẩu không đúng.');
        
        const attemptNo = attempted + 1;
        const isRetake = retake ? true : false;
        
        return { attemptNo, isRetake };
    }
    
    async create(
        studentId: number,
        sessionPassword: string,
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
            .validateAttemptEligibility(studentId, dto.sessionId, sessionPassword);
        
        return await this.prisma.student_attempts.create({
            data: {
                student_id: studentId,
                session_id: dto.sessionId,
                form_id: dto.formId,
                ip_address: dto.ipAddress,
                device_info: dto.deviceInfo,
                attempt_no: attemptNo,
                is_retake: isRetake,
            },
        });
    }
    
    /**
     * nộp bài --> submitTime, attemptStatus = submitted | timeout
     * tính điểm --> totalScore, attemptStatus = graded
     */
    async update(
        studentId: number,
        attemptId: number,
        answers: CreateStudentAnswerDto[],
    ) {
        /**
         * ghi đáp án sinh viên đã chọn vào db
         * -> create student_attempt_answers
         */
        await this.validateStudentOwnership(studentId, attemptId);

        return await this.prisma.student_attempt_answers.createMany({
            data: answers.map((a) => ({
                attempt_id: attemptId,
                form_question_id: a.questionId,
                form_answer_id: a.answerId,
            })),
        });
    }

    async submit(
        attemptId: number,
    ) {

    }

    async grade(
        attemptId: number,
    ) {

    }

    private selectForStudent = {
        attempt_id: true,
        student_id: true,
        session_id: true,
        form_id: true,
        attempt_status: true,
        attempt_no: true,
        is_retake: true,
        start_time: true,
        submit_time: true,
    };
    
    async getById(
        userId: number,
        role: Role,
        attemptId: number,
    ) {
        /**
         * ẩn điểm đối với sv 
         * khi chưa nộp bài
         * hoặc khi đã nộp bài nhưng đang diễn ra kỳ thi 
         * và gv đặt showResult = false
         */
        /**
         * không trả về bài làm khi đang diễn ra kỳ thi
         * và gv đặt 
         */

        /**
         * xác thực gv/sv
         */


        switch (role) {
            case Role.ADMIN:
                break;

            case Role.TEACHER:
                await this.validateTeacherOwnership(userId, attemptId);
                break;

            case Role.STUDENT:
                break;

            default:
                break;
        }
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
        } = query;

        /**
         * ẩn điểm đối với sv 
         * khi chưa nộp bài
         * hoặc khi đã nộp bài nhưng đang diễn ra kỳ thi 
         * và gv đặt showResult = false
         */
        /**
         * không trả về bài làm khi đang diễn ra kỳ thi
         * và gv đặt 
         */


        let where = {};
        const select = (role === Role.STUDENT) ? this.selectForStudent : undefined;

        switch (role) {
            case Role.TEACHER:
                
                break;

            case Role.STUDENT:
                break;

            default:
                break;
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.student_attempts.findMany({
                where,
                select,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    student_id: 'asc',
                },
            }),

            this.prisma.student_attempts.count({ where }),
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

    async getAnswers(

    ) {

    }
}