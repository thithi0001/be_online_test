import { Module } from "@nestjs/common";
import { SessionController } from "./examSession.controller";
import { ExamSessionService } from "./examSession.service";
import { TemplateModule } from "../examTemplate/examTemplate.module";

@Module({
    imports: [TemplateModule],
    controllers: [SessionController],
    providers: [ExamSessionService],
    exports: [ExamSessionService]
})
export class SessionModule {}