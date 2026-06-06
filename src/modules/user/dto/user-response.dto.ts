import { PaginationResponseDto } from '@/common/dtos/pagination-response.dto';
import { Role } from '@/common/enums/role.enum';
import { Expose, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UserResponseDto {
    @Expose({name: 'user_id'})
    userId: number;

    @Expose()
    email: string;

    @Expose({name: 'full_name'})
    fullName: string;

    @Expose()
    role: Role;
}

export class PaginatedUserDto 
    extends PaginationResponseDto<UserResponseDto> {}

export class QueryUserDto {
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
}