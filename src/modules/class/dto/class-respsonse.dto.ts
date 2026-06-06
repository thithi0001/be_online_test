import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { Expose, Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class ClassRespsonseDto {
    @Expose({name: 'class_id'})
    classId: number;

    @Expose({name: 'teacher_id'})
    teacherId: number;

    @Expose({name: 'class_name'})
    className: string;

    @Expose()
    @Transform(({obj}) => obj._count.student_class)
    numberOfStudents?: number;
}

export class PaginatedClassDto
    extends PaginationResponseDto<ClassRespsonseDto> {}

export class QueryClassDto {
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

export class ClassMemberResponseDto {
    @Expose({name: 'user_id'})
    studentId: number;

    @Expose()
    email: string;

    @Expose({name: 'full_name'})
    fullName: string;
}