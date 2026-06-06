import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateEventDto } from "./dto/proctoring.dto";
import { QueryEventDto } from "./dto/proctoring-response.dto";

@Injectable()
export class ProctoringService {
    constructor(private prisma: PrismaService) {}

    async validateTeacherOwnership(
        teacherId: number, 
        eventId: number,
    ) {
        const existed = await this.prisma.proctoring_events.findFirst({
            where: {
                event_id: eventId,
                student_attempts: {
                    exam_sessions: {
                        created_by: teacherId,
                    },
                },
            },
            select: {
                event_id: true,
            },
        });

        if (!existed)
            throw new BadRequestException('Không có quyền xem hoặc sự kiện không tồn tại.');
    }
    
    async validateAndReturn(
        teacherId: number, 
        eventId: number,
    ) {
        const existed = await this.prisma.proctoring_events.findFirst({
            where: {
                event_id: eventId,
                student_attempts: {
                    exam_sessions: {
                        created_by: teacherId,
                    },
                },
            },
            include: {
                student_attempts: { select: { users: { 
                    select: { full_name: true },},},
                },
            },
        });

        if (!existed)
            throw new BadRequestException('Không có quyền xem hoặc sự kiện không tồn tại.');

        return existed;
    }
    
    async create(
        dto: CreateEventDto,
    ) {
        return await this.prisma.proctoring_events.create({
            data: {
                attempt_id: dto.attemptId,
                event_type: dto.eventType,
                metadata: dto.metadata,
            },
        });
    }
    
    async getById(
        teacherId: number,
        eventId: number,
    ) {
        return await this.validateAndReturn(teacherId, eventId);
    }
    
    async getMany(
        teacherId: number,
        query: QueryEventDto,
    ) {
        const {
            page = 1,
            limit = 10,
            sessionId,
            attemptId,
            studentId,
            classId,
            eventType,
        } = query;

        const where = {
            student_attempts: {
                ...(sessionId && { session_id: sessionId }),
                ...(attemptId && { attempt_id: attemptId }),
                ...(studentId && { student_id: studentId }),
                exam_sessions: {
                    created_by: teacherId,
                    ...(classId && { exam_session_class: {
                            some: { class_id: classId },
                        },
                    }),
                },
            },
            ...(eventType && { event_type: eventType }),
        };
        
        const [data, total] = await this.prisma.$transaction([
            this.prisma.proctoring_events.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { 
                    event_time: 'desc',
                },
                include: {
                student_attempts: { select: { users: { 
                    select: { full_name: true },},},
                },
            },
            }),

            this.prisma.proctoring_events.count({ where }),
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