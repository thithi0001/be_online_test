import { PaginationResponseDto } from '@/common/dtos/pagination-response.dto';
import { Role } from '@/common/enums/role.enum';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

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
    keyword?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}