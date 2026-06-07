import { PaginationMetaDto, PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { Expose, Transform, Type } from "class-transformer";
import { IsOptional, IsString, IsInt, Min, IsBoolean } from "class-validator";

export class NotificationResponseDto {
    @Expose({name: 'noti_id'})
    notiId: number;
    
    @Expose({name: 'm_content'})
    content: string;

    @Expose({name: 'created_by'})
    createdBy: number;

    @Expose({name: 'created_at'})
    createdAt: Date;

    @Expose()
    @Transform(({obj}) => obj.noti_users.is_read)
    isRead: boolean;
}

export class PaginatedNotificationDto
{
    @Expose()
    @Type(() => NotificationResponseDto)
    data: NotificationResponseDto[];

    @Expose()
    @Type(() => PaginationMetaDto)
    pagination: PaginationMetaDto;
}
    
export class QueryNotificationDto {
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
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    isRead?: boolean;
}

