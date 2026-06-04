import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { AttemptStatus } from "@/common/enums/statuses.enum";
import { Expose } from "class-transformer";
import { IsOptional } from "class-validator";

export class AttemptResponseDto {
    @Expose({name: 'attempt_id'})
    attemptId: number;

    @Expose({name: 'student_id'})
    studentId: number;

    @Expose({name: 'session_id'})
    sessionId: number;

    @Expose({name: 'form_id'})
    formId: number;

    @Expose({name: 'ip_address'})
    ipAddress: string;

    @Expose({name: 'device_info'})
    deviceInfo: string;

    @Expose({name: 'attempt_no'})
    attemptNo: number;

    @Expose({name: 'is_retake'})
    isRetake: boolean;

    @Expose({name: 'start_time'})
    startTime: Date;

    @Expose({name: 'submit_time'})
    submitTime: Date;

    @Expose({name: 'total_score'})
    totalScore: number;
}

export class AttemptAnswerResponseDto {
    @Expose()
    questionId: number;

    @Expose()
    answerId: number;
}

export class PaginatedAttemptDto 
    extends PaginationResponseDto<AttemptResponseDto> {}

export class QueryAttemptDto {
    @IsOptional()
    page?: number;
    
    @IsOptional()
    limit?: number;
    
    @IsOptional()
    studentId?: number;
    
    @IsOptional()
    sessionId?: number;
    
    @IsOptional()
    isRetake?: boolean;
    
    @IsOptional()
    status?: AttemptStatus;
}

