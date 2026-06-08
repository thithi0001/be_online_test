import { PaginationMetaDto, PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { PartialType } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateSubjectDto {
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
    @Transform(({obj}) => obj?._count?.question_banks ?? 0)
    numberOfQuestions?: number;
    
    @Expose()
    @Transform(({obj}) => obj?._count?.exam_templates ?? 0)
    numberOfTemplates?: number;
}

export class PaginatedSubjectDto 
{
    @Expose()
    @Type(() => SubjectResponseDto)
    data: SubjectResponseDto[];

    @Expose()
    @Type(() => PaginationMetaDto)
    pagination: PaginationMetaDto;
}
    
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