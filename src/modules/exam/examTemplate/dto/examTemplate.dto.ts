import { PartialType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateExamTemplateDto {
    @IsNumber()
    templateId?: number;
    
    @IsNumber()
    teacherId: number;
    
    @IsNumber()
    subjectId: number;
    
    @IsString()
    templateName: string;
}

export class UpdateExamTemplateDto 
    extends PartialType(CreateExamTemplateDto) {}

export class CreateTemplateQuestionDto {
    @IsNumber()
    templateId?: number;
    
    @IsNumber()
    questionId: number;
    
    @IsNumber()
    score: number;
    
    @IsNumber()
    orderIndex: number;
}

export class UpdateTemplateQuestionDto 
    extends PartialType(CreateTemplateQuestionDto) {}