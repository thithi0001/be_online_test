import { Module } from "@nestjs/common";
import { TemplateController } from "./examTemplate.controller";
import { ExamTemplateService } from "./examTemplate.service";

@Module({
    imports: [],
    controllers: [TemplateController],
    providers: [ExamTemplateService],
    exports: [ExamTemplateService],
})
export class TemplateModule {}