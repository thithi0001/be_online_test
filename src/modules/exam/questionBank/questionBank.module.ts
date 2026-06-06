import { Module } from "@nestjs/common";
import { QuestionController } from "./questionBank.controller";
import { QuestionBankService } from "./questionBank.service";

@Module({
    imports: [],
    controllers: [QuestionController],
    providers: [QuestionBankService],
    exports: [QuestionBankService],
})
export class QuestionModule {}