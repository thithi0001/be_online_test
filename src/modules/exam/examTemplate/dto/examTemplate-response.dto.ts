import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { QuestionType } from "@/common/enums/questionType.enum";
import { Expose, Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { AnswerResponseDto, QuestionResponseDto } from "../../questionBank/dto/question-response.dto";
import { WithTotalResponseDto } from "@/common/dtos/with-total-response.dto";

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

    @Expose()
    @Transform(({obj}) => obj._count.exam_template_questions)
    numberOfQuestions?: number;
}

export class PaginatedTemplateDto
    extends PaginationResponseDto<ExamTemplateResponseDto> {}

export class QueryTemplateDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    createdBy?: number
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
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

export class TemplateQuestionArrayResponseDto 
    extends WithTotalResponseDto<TemplateQuestionResponseDto> {}