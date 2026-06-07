import { PaginationMetaDto, PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { RetakeStatus } from "@/common/enums/statuses.enum";
import { Expose, Type } from "class-transformer";
import { IsOptional, IsInt, Min, IsEnum } from "class-validator";

export class RetakeResponseDto {
    @Expose({name: 'request_id'})
    requestId: number;

    @Expose({name: 'session_id'})
    sessionId: number;

    @Expose({name: 'student_id'})
    studentId: number;

    @Expose()
    reason: string;

    @Expose({name: 'request_status'})
    RetakeStatus: RetakeStatus;

    @Expose({name: 'created_at'})
    createdAt: Date;
}

export class PaginatedRetakeDto 
{
    @Expose()
    @Type(() => RetakeResponseDto)
    data: RetakeResponseDto[];

    @Expose()
    @Type(() => PaginationMetaDto)
    pagination: PaginationMetaDto;
}
    
export class QueryRetakeDto {
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
    studentId?: number;

    @IsOptional()
    @IsEnum(RetakeStatus)
    status?: RetakeStatus;
}

export class PermissionResponseDto {
    @Expose({name: 'permission_id'})
    permissionId: number;

    @Expose({name: 'request_id'})
    requestId: number;

    @Expose({name: 'available_from'})
    availableFrom: Date;

    @Expose({name: 'available_to'})
    availableTo: Date;
    
    @Expose({name: 'max_attempt'})
    maxAttempt: number;

    @Expose({name: 'created_by'})
    createdBy: number;

    @Expose({name: 'created_at'})
    createdAt: Date;
}

export class PaginatedPermissionDto 
{
    @Expose()
    @Type(() => PermissionResponseDto)
    data: PermissionResponseDto[];

    @Expose()
    @Type(() => PaginationMetaDto)
    pagination: PaginationMetaDto;
}
    
export class QueryPermissionDto {
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
    studentId?: number;
}