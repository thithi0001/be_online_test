import { AttemptStatus, SessionStatus } from "@/common/enums/statuses.enum";
import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AttemptService } from "../attempt/attempt.service";

@Injectable()
export class SchedulerService {
    constructor(
        private prisma: PrismaService,
        private attemptService: AttemptService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async updateSessionStatus() {
        const now = new Date();

        await this.prisma.exam_sessions.updateMany({
            where: {
                session_status: SessionStatus.PUBLISHED,
                start_time: { lte: now },
            },
            data: {
                session_status: SessionStatus.ONGOING,
            },
        });

        await this.prisma.exam_sessions.updateMany({
            where: {
                session_status: SessionStatus.ONGOING,
                end_time: { lte: now },
            },
            data: {
                session_status: SessionStatus.FINISHED,
            },
        });
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async autoSubmitExpiredAttempt() {
        const now = new Date();

        const attempts = await this.prisma.student_attempts.findMany({
            where: {
                attempt_status: AttemptStatus.INPROGRESS,
            },
            include: { 
                exam_sessions: {
                    select: {
                        duration: true,
                        end_time: true,
                    },
                },
            },
        });

        for (const attempt of attempts) {

            if (
                !attempt.start_time 
                || !attempt.exam_sessions.duration
            ) {
                continue;
            }

            const expireTime = new Date(
                attempt.start_time.getTime() +
                attempt.exam_sessions.duration * 60000
            );

            if (
                !(expireTime <= now
                || attempt.exam_sessions.end_time <= now)
            ) {
                continue;
            }

            await this.attemptService.submit(
                attempt.student_id,
                attempt.attempt_id,
                [],
                [],
                AttemptStatus.TIMEOUT,
            );
        }
    }
}