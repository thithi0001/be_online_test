import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { QuestionType } from "@/common/enums/questionType.enum";
import { Expose, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class AnswerResponseDto {
    @Expose({name: 'answer_id'})
    answerId: number;
    
    @Expose({name: 'is_correct'})
    isCorrect?: boolean;
    
    @Expose({name: 'm_content'})
    content: string;
    
    @Expose({name: 'order_index'})
    orderIndex: string;
}

export class QuestionResponseDto {
    @Expose({name: 'question_id'})
    questionId?: number;
    
    @Expose({name: 'sub_id'})
    subjectId?: number;
    
    @Expose({name: 'created_by'})
    createdBy?: number;
    
    @Expose({name: 'q_type'})
    qType: QuestionType;
    
    @Expose({name: 'm_content'})
    content: string;
    
    @Expose({name: 'difficulty'})
    difficulty?: number;

    @Expose({name: 'is_active'})
    isActive?: string;

    @Type(() => AnswerResponseDto)
    @Expose({name: 'answer_banks'})
    answers: AnswerResponseDto[];
}

export class PaginatedQuestionDto
    extends PaginationResponseDto<QuestionResponseDto> {}

export class QueryQuestionDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    subjectId?: number;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    createdBy?: number;

    @IsOptional()
    @IsEnum(QuestionType)
    qType?: QuestionType;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    difficulty?: number;
}