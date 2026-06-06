import { PrismaService } from "@/prisma/prisma.service";
import { retake_permissions, retake_requests } from "@prisma/client";
import { BadRequestException, Injectable } from "@nestjs/common";
import { ExamSessionService } from "../exam/examSession/examSession.service";
import { AttemptService } from "../attempt/attempt.service";
import { Role } from "@/common/enums/role.enum";
import { RetakeStatus } from "@/common/enums/statuses.enum";
import { CreateRetakeDto, CreatePermissionDto } from "./dto/retake.dto";
import { QueryPermissionDto, QueryRetakeDto } from "./dto/retake-response.dto";

@Injectable()
export class RetakeService {
    constructor(
        private prisma: PrismaService,
        private examSessionService: ExamSessionService,
        private attemptService: AttemptService,
    ) {}

    async validateTeacherOwnerShip(
        teacherId: number,
        retakeId: number,
        mode: 'request' | 'permission',
    ) {
        switch (mode) {
            case "request":
                const request = await this.prisma.retake_requests.findFirst({
                    where: {
                        request_id: retakeId,
                        exam_sessions: {
                            created_by: teacherId,
                        },
                    },
                    select: {
                        request_id: true,
                    },
                });
        
                if (!request)
                    throw new BadRequestException('Không có quyền xem hoặc yêu cầu không tồn tại.');
                break;

            case "permission":
                const permission = await this.prisma.retake_permissions.findFirst({
                    where: {
                        permission_id: retakeId,
                        retake_requests: {
                            exam_sessions: {
                                created_by: teacherId,
                            },
                        },
                    },
                    select: {
                        permission_id: true,
                    },
                });
        
                if (!permission)
                    throw new BadRequestException('Không có quyền xem hoặc yêu cầu không tồn tại.');
                break;
        }
    }

    async validateAndReturnForTeacher(
        teacherId: number,
        retakeId: number,
        mode: 'request',
    ): Promise<retake_requests>;
    async validateAndReturnForTeacher(
        teacherId: number,
        retakeId: number,
        mode: 'permission',
    ): Promise<retake_permissions>;
    async validateAndReturnForTeacher(
        teacherId: number,
        retakeId: number,
        mode: 'request' | 'permission',
    ): Promise<retake_requests | retake_permissions> {
        if (mode === 'request') {
            const request = await this.prisma.retake_requests.findFirst({
                where: {
                    request_id: retakeId,
                    exam_sessions: {
                        created_by: teacherId,
                    },
                },
            });
    
            if (!request)
                throw new BadRequestException('Không có quyền xem hoặc yêu cầu không tồn tại.');
            
            return request;
        } else {   
            const permission = await this.prisma.retake_permissions.findFirst({
                where: {
                    permission_id: retakeId,
                    retake_requests: {
                        exam_sessions: {
                            created_by: teacherId,
                        },
                    },
                },
            });
            
            if (!permission)
                throw new BadRequestException('Không có quyền xem hoặc yêu cầu không tồn tại.');

            return permission;
        }
    }

    async validateStudentOwnerShip(
        studentId: number,
        retakeId: number,
        mode: 'request' | 'permission',
    ) {
        switch (mode) {
            case "request":
                const request = await this.prisma.retake_requests.findFirst({
                    where: {
                        student_id: studentId,
                        request_id: retakeId,
                    },
                    select: {
                        request_id: true,
                    },
                });
        
                if (!request)
                    throw new BadRequestException('Không có quyền xem hoặc yêu cầu không tồn tại.');
                break;

            case "permission":
                const permission = await this.prisma.retake_permissions.findFirst({
                    where: {
                        permission_id: retakeId,
                        retake_requests: {
                            student_id: studentId,
                        },
                    },
                    select: {
                        permission_id: true,
                    },
                });
        
                if (!permission)
                    throw new BadRequestException('Không có quyền xem hoặc yêu cầu không tồn tại.');
                break;
        }
    }

    async validateAndReturnForStudent(
        studentId: number,
        retakeId: number,
        mode: 'request',
    ): Promise<retake_requests>;
    async validateAndReturnForStudent(
        studentId: number,
        retakeId: number,
        mode: 'permission',
    ): Promise<retake_permissions>;
    async validateAndReturnForStudent(
        studentId: number,
        retakeId: number,
        mode: 'request' | 'permission',
    ): Promise<retake_requests | retake_permissions> {
        if (mode === 'request') {
            const request = await this.prisma.retake_requests.findFirst({
                where: {
                    student_id: studentId,
                    request_id: retakeId,
                },
            });
            
            if (!request)
                throw new BadRequestException('Không có quyền xem hoặc yêu cầu không tồn tại.');
            
            return request;
        } else {   
            const permission = await this.prisma.retake_permissions.findFirst({
                where: {
                    permission_id: retakeId,
                    retake_requests: {
                        student_id: studentId,
                    },
                },
            });
            
            if (!permission)
                throw new BadRequestException('Không có quyền xem hoặc yêu cầu không tồn tại.');
            
            return permission;
        }
    }

    async create(
        studentId: number,
        dto: CreateRetakeDto,
    ) {
        // kiểm tra sv có được phép tham gia kỳ thi
        const session = await this.examSessionService.validateAndReturnForStudent(studentId, dto.sessionId);
        
        // kiểm tra nếu sinh viên đã đạt giới hạn số lần làm bài
        const { reachedLimit } = await this.attemptService.validateAttemptLimit(studentId, dto.sessionId, session);
        if (!reachedLimit)
            throw new BadRequestException(
                'Chưa đạt giới hạn cho phép làm bài.',
            );

        return await this.prisma.retake_requests.create({
            data: {
                student_id: studentId,
                session_id: dto.sessionId,
                reason: dto.reason,
            },
        });
    }

    async update(
        teacherId: number,
        requestId: number,
        status: RetakeStatus,
    ) {
        await this.validateTeacherOwnerShip(teacherId, requestId, 'request');

        return await this.prisma.retake_requests.update({
            where: {
                request_id: requestId,
            },
            data: {
                request_status: status,
            },
        });
    }

    async getRetakeById(
        userId: number,
        role: Role,
        requestId: number,
    ) {
        switch (role) {
            case Role.ADMIN:
                break;

            case Role.TEACHER:
                await this.validateAndReturnForStudent(userId, requestId, 'request');
                break;

            case Role.STUDENT:
                await this.validateAndReturnForStudent(userId, requestId, 'request');
                break;

            default:
                break;
        }
    }
    
    async getManyRetakes(
        userId: number,
        role: Role,
        query: QueryRetakeDto,
    ) {
        const {
            page = 1, 
            limit = 10,
            sessionId,
            studentId,
            status,
        } = query;

        if (!!sessionId) {
            switch (role) {
                case Role.ADMIN:
                    break;

                case Role.TEACHER:
                    await this.examSessionService.validateTeacherOwnership(userId, sessionId);
                    break;

                case Role.STUDENT:
                    await this.examSessionService.validateAndReturnForStudent(userId, sessionId)    ;
                    break;

                default:
                    break;
            }
        }

        const where = {
            ...(sessionId && { session_id: sessionId }),
            ...(studentId && { student_id: studentId }),
            ...(status && { request_status: status }),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.retake_requests.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { 
                    created_at: 'desc',
                },
            }),

            this.prisma.retake_requests.count({ where }),
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

    async rejectRetake(
        teacherId: number,
        requestId: number,
    ) {
        await this.validateTeacherOwnerShip(teacherId, requestId, 'request');

        return await this.update(teacherId, requestId, RetakeStatus.REJECTED);
    }

    // createPermission
    async grantPermission(
        teacherId: number,
        requestId: number,
        dto: CreatePermissionDto,
    ) {
        const request = await this.validateAndReturnForTeacher(teacherId, requestId, 'request');
        const session = await this.prisma.exam_sessions.findUnique({
            where: {
                session_id: request.session_id,
            }, 
            select: {
                attempt_limit: true,
            },
        });

        if (!session)
            throw new BadRequestException('Kỳ thi không tồn tại.');

        await this.update(teacherId, requestId, RetakeStatus.GRANTED);

        return await this.prisma.retake_permissions.create({
            data: {
                request_id: requestId,
                created_by: teacherId,
                available_from: dto.availableFrom,
                available_to: dto.availableTo,
                max_attempt: Number(session.attempt_limit) + Number(dto.attemptLimit ?? 0),
            },
        });
    }

    async getPermissionById(
        userId: number,
        role: Role,
        permissionId: number,
    ) {
        switch (role) {
            case Role.ADMIN:
                break;

            case Role.TEACHER:
                await this.validateAndReturnForStudent(userId, permissionId, 'permission');
                break;

            case Role.STUDENT:
                await this.validateAndReturnForStudent(userId, permissionId, 'permission');
                break;

            default:
                break;
        }
    }

    async getManyPermission(
        userId: number,
        role: Role,
        query: QueryPermissionDto,
    ) {
        const {
            page = 1, 
            limit = 10,
            sessionId,
            studentId,
        } = query;

        if (!!sessionId) {
            switch (role) {
                case Role.ADMIN:
                    break;

                case Role.TEACHER:
                    await this.examSessionService.validateTeacherOwnership(userId, sessionId);
                    break;

                case Role.STUDENT:
                    await this.examSessionService.validateAndReturnForStudent(userId, sessionId)    ;
                    break;

                default:
                    break;
            }
        }

        const where = {
            retake_requests: {
                ...(studentId && { student_id: studentId }),
                ...(sessionId && { session_id: sessionId }),
            },
        };
        
        const [data, total] = await this.prisma.$transaction([
            this.prisma.retake_permissions.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { 
                    created_at: 'desc',
                },
            }),

            this.prisma.retake_permissions.count({ where }),
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