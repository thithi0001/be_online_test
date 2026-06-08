import { QuestionType } from "@/common/enums/questionType.enum";
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateQuestionBankDto {
    @IsInt()
    subjectId: number;
    
    @IsEnum(QuestionType)
    qType: QuestionType;

    @IsString()
    @IsNotEmpty()
    content: string;
    
    @IsOptional()
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

