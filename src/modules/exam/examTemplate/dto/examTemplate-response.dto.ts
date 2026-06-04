import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { QuestionType } from "@/common/enums/questionType.enum";
import { Expose, Type } from "class-transformer";
import { IsOptional } from "class-validator";
import { AnswerResponseDto, QuestionResponseDto } from "../../questionBank/dto/question-response.dto";

export class ExamTemplateResponseDto {
    @Expose({name: 'template_id'})
    templateId: number;
    
    @Expose({name: 'created_by'})
    createdBy: number;
    
    @Expose({name: 'sub_id'})
    subjectId: number;
    
    @Expose({name: 'template_name'})
    templateName: string;

    @Expose({name: 'is_active'})
    isActive: boolean;
}

export class PaginatedTemplateDto
    extends PaginationResponseDto<ExamTemplateResponseDto> {}

export class QueryTemplateDto {
    @IsOptional()
    keyword?: string;

    @IsOptional()
    page?: number

    @IsOptional()
    limit?: number
    
    @IsOptional()
    createdBy?: number
    
    @IsOptional()
    subjectId?: number
}

export class TemplateQuestionResponseDto {
    @Expose({name: 'question_id'})
    questionId: number;
    
    @Expose()
    score: number;
    
    @Expose({name: 'order_index'})
    orderIndex: number;

    @Type(() => QuestionResponseDto)
    @Expose({name: 'question_banks'})
    data: QuestionResponseDto;
}