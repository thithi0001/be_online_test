import { PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { PartialType } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSubjectDto {
    @IsNumber()
    subjectId?: number;

    @IsNumber()
    createdBy: number;

    @IsString()
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
}

export class PaginatedSubjectDto 
    extends PaginationResponseDto<SubjectResponseDto> {}

export class QuerySubjectDto {
    @IsOptional()
    keyword?: string;

    @IsOptional()
    page?: number;
    
    @IsOptional()
    limit?: number;

    @IsOptional()
    createdBy?: number;
}