import { PaginationMetaDto, PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { EventType } from "@/common/enums/event-type.enum";
import { Expose, Transform, Type } from "class-transformer";
import { IsOptional, IsInt, Min, IsEnum } from "class-validator";

export class ProctoringEventResponseDto {
    @Expose({name: 'event_id'})
    eventId: number;
    
    @Expose({name: 'attempt_id'})
    attemptId: number;    

    @Expose()
    @Transform(({obj}) => obj.student_attempts.users.full_name)
    studentName: string;

    @Expose({name: 'event_type'})
    eventType: EventType;
    
    @Expose({name: 'event_time'})
    eventTime: Date;

    @Expose()
    metadata: Record<string, any>;
}

export class PaginatedEventDto 
{
    @Expose()
    @Type(() => ProctoringEventResponseDto)
    data: ProctoringEventResponseDto[];

    @Expose()
    @Type(() => PaginationMetaDto)
    pagination: PaginationMetaDto;
}
    
export class QueryEventDto {
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
    sessionId?: number;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    attemptId?: number;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    studentId?: number;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    classId?: number;
    
    @IsOptional()
    @IsEnum(EventType)
    eventType?: EventType;
}