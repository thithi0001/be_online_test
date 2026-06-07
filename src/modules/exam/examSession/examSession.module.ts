import { Module } from "@nestjs/common";
import { SessionController } from "./examSession.controller";
import { ExamSessionService } from "./examSession.service";
import { TemplateModule } from "../examTemplate/examTemplate.module";
import { NotificationModule } from "@/modules/notification/notification.module";

@Module({
    imports: [
        TemplateModule,
        NotificationModule,
    ],
    controllers: [SessionController],
    providers: [ExamSessionService],
    exports: [ExamSessionService]
})
export class SessionModule {}