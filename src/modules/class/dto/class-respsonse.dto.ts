import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { Expose } from "class-transformer";
import { IsOptional } from "class-validator";

export class ClassRespsonseDto {
    @Expose({name: 'class_id'})
    classId: number;

    @Expose({name: 'teacher_id'})
    teacherId: number;

    @Expose({name: 'class_name'})
    className: string;
}

export class PaginatedClassDto
    extends PaginationResponseDto<ClassRespsonseDto> {}

export class QueryClassDto {
    @IsOptional()
    keyword?: string;

    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;
}

export class ClassMemberDto {
    @Expose({name: 'user_id'})
    studentId: number;

    @Expose()
    email: string;

    @Expose({name: 'full_name'})
    fullName: string;
}