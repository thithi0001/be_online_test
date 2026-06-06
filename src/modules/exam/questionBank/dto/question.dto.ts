import { QuestionType } from "@/common/enums/questionType.enum";
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsString, MaxLength, ValidateNested } from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateQuestionBankDto {
    @IsInt()
    questionId?: number;

    @IsInt()
    subjectId: number;

    @IsInt()
    createdBy: number;
    
    @IsEnum(QuestionType)
    qType: QuestionType;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsInt()
    difficulty?: number;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested()
    @Type(() => CreateAnswerBankDto)
    answers: CreateAnswerBankDto[];
}

export class UpdateQuestionBankDto 
    extends PartialType(CreateQuestionBankDto) {}

export class CreateAnswerBankDto {
    @IsInt()
    answerId?: number;

    @IsInt()
    questionId?: number;
    
    @IsBoolean()
    isCorrect: boolean;
    
    @IsString()
    @IsNotEmpty()
    content: string;
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(1)
    orderIndex: string;
}

export class UpdateAnswerBankDto 
    extends PartialType(CreateAnswerBankDto) {}

