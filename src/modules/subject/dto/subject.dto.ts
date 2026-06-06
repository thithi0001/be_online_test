import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { PartialType } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateSubjectDto {
    @IsInt()
    subjectId?: number;

    @IsInt()
    createdBy?: number;

    @IsString()
    @IsNotEmpty()
    subjectName: string;
}

export class UpdateSubjectDto 
    extends PartialType(CreateSubjectDto) {}

export class SubjectResponseDto {
    @Expose({name: 'sub_id'})
    subjectId: number;

    @Expose({name: 'created_by'})
    createdBy: number;

    @Expose({name: 'sub_name'})
    subjectName: string;

    @Expose()
    @Transform(({obj}) => obj._count.question_banks)
    numberOfQuestions?: number;
}

export class PaginatedSubjectDto 
    extends PaginationResponseDto<SubjectResponseDto> {}

export class QuerySubjectDto {
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
    @Type(() => Number)
    @IsInt()
    createdBy?: number;
}