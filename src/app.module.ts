import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/users.module";
import { ClassModule } from "./modules/class/class.module";
import { SubjectModule } from "./modules/subject/subject.module";
import { QuestionModule } from "./modules/exam/questionBank/questionBank.module";
import { TemplateModule } from "./modules/exam/examTemplate/examTemplate.module";
import { SessionModule } from "./modules/exam/examSession/examSession.module";
import { AttemptModule } from "./modules/attempt/attempt.module";
import { ProctoringModule } from "./modules/proctoring/proctoring.module";
import { RetakeModule } from "./modules/retake/retake.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { ScheduleModule } from "@nestjs/schedule";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        SchedulerModule,
        PrismaModule,
        AuthModule,
        UserModule,
        ClassModule,
        SubjectModule,
        QuestionModule,
        TemplateModule,
        SessionModule,
        AttemptModule,
        ProctoringModule,
        RetakeModule,
        NotificationModule,
    ],
    controllers: [AppController],
    providers: [AppService],
    exports: [AppService]
})
export class AppModule {}