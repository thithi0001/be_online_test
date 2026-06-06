import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { AttemptStatus } from "@/common/enums/statuses.enum";
import { Expose, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from "class-validator";

export class AttemptResponseDto {
    @Expose({name: 'attempt_id'})
    attemptId: number;

    @Expose({name: 'student_id'})
    studentId: number;

    @Expose({name: 'session_id'})
    sessionId: number;

    @Expose({name: 'ip_address'})
    ipAddress: string;

    @Expose({name: 'device_info'})
    deviceInfo: string;

    @Expose({name: 'attempt_no'})
    attemptNo: number;

    @Expose({name: 'is_retake'})
    isRetake: boolean;

    @Expose({name: 'shuffle_seed'})
    shuffleSeed: string;

    @Expose({name: 'start_time'})
    startTime: Date;

    @Expose({name: 'submit_time'})
    submitTime?: Date;

    @Expose({name: 'total_score'})
    totalScore?: number;
}

export class SelectedAnswerResponseDto {
    @Expose({name: 'answer_id'})
    answerId: number;
}

export class AttemptWithAnswerResponseDto {
    @Type(() => AttemptResponseDto)
    @Expose()
    attempt: AttemptResponseDto;
    
    @Type(() => SelectedAnswerResponseDto)
    @Expose()
    selectedAnswers: SelectedAnswerResponseDto[];
}

export class PaginatedAttemptDto 
    extends PaginationResponseDto<AttemptResponseDto> {}

export class QueryAttemptDto {
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
    studentId?: number;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sessionId?: number;
    
    @IsOptional()
    @IsBoolean()
    isRetake?: boolean;
    
    @IsOptional()
    @IsEnum(AttemptStatus)
    status?: AttemptStatus;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    classId?: number;
}

