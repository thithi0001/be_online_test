import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { SessionStatus } from "@/common/enums/statuses.enum";
import { Expose } from "class-transformer";
import { IsOptional } from "class-validator";

export class ExamSessionResponseDto {
    @Expose({name: 'session_id'})
    sessionId: number;

    @Expose({name: 'created_by'})
    teacherId: number;

    @Expose({name: 'template_id'})
    templateId: number;

    @Expose({name: 'session_name'})
    sessionName: string;

    @Expose({name: ''})
    duration: number;

    @Expose({name: 'shuffle_questions'})
    shuffleQuestions?: boolean;

    @Expose({name: 'shuffle_answers'})
    shuffleAnswers?: boolean;

    @Expose({name: 'auto_submit'})
    autoSubmit?: boolean;

    @Expose({name: 'allow_review'})
    allowReview?: boolean;

    @Expose({name: 'show_result'})
    showResult?: boolean;

    @Expose({name: 'start_time'})
    startTime: Date;

    @Expose({name: 'end_time'})
    endTime: Date;

    @Expose({name: 'attempt_limit'})
    attemptLimit: number;

    @Expose({name: 'session_status'})
    sessionStatus: SessionStatus;
}

export class PaginatedSessionDto
    extends PaginationResponseDto<ExamSessionResponseDto> {}

export class QuerySessionDto {
    @IsOptional()
    keyword?: string;

    @IsOptional()
    page?: number

    @IsOptional()
    limit?: number
    
    @IsOptional()
    createdBy?: number
    
    @IsOptional()
    status?: SessionStatus;
    
    @IsOptional()
    classId?: number;

    @IsOptional()
    startFrom?: Date;

    @IsOptional()
    startTo?: Date;
}