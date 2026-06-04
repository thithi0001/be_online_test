import { QuestionType } from "@/common/enums/questionType.enum";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsString, ValidateNested } from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateQuestionBankDto {
    @IsNumber()
    questionId?: number;

    @IsNumber()
    subjectId: number;

    @IsNumber()
    createdBy: number;
    
    @IsEnum(QuestionType)
    qType: QuestionType;

    @IsString()
    content: string;

    @IsNumber()
    difficulty?: number;

    @IsArray()
    @ValidateNested()
    @Type(() => CreateAnswerBankDto)
    answers: CreateAnswerBankDto[];
}

export class UpdateQuestionBankDto 
    extends PartialType(CreateQuestionBankDto) {}

export class CreateAnswerBankDto {
    @IsNumber()
    answerId?: number;

    @IsNumber()
    questionId?: number;
    
    @IsBoolean()
    isCorrect: boolean;
    
    @IsString()
    content: string;
    
    @IsString()
    orderIndex: string;
}

export class UpdateAnswerBankDto 
    extends PartialType(CreateAnswerBankDto) {}

