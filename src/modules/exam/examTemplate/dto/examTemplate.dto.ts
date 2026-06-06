import { PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsNumber, IsString, Min, ValidateNested } from "class-validator";

export class CreateExamTemplateDto {
    @IsInt()
    templateId?: number;
    
    @IsInt()
    teacherId: number;
    
    @IsInt()
    subjectId: number;
    
    @IsString()
    @IsNotEmpty()
    templateName: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested()
    @Type(() => CreateTemplateQuestionDto)
    questions: CreateTemplateQuestionDto[];
}

export class UpdateExamTemplateDto 
    extends PartialType(CreateExamTemplateDto) {}

export class CreateTemplateQuestionDto {
    @IsInt()
    templateId?: number;
    
    @IsInt()
    questionId: number;
    
    @IsNumber()
    @Min(0)
    score: number;
    
    @IsInt()
    @Min(1)
    orderIndex: number;
}

export class UpdateTemplateQuestionDto 
    extends PartialType(CreateTemplateQuestionDto) {}