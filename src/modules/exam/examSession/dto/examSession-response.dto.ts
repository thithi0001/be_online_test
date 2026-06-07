import { PaginationMetaDto, PaginationResponseDto } from "@/common/dtos/pagination-response.dto";
import { SessionStatus } from "@/common/enums/statuses.enum";
import { Expose, Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class ExamSessionResponseDto {
    @Expose({name: 'session_id'})
    sessionId: number;

    @Expose({name: 'created_by'})
    teacherId: number;

    @Expose({name: 'template_id'})
    templateId: number;

    @Expose({name: 'session_name'})
    sessionName: string;

    @Expose({name: ''})
    duration: number;

    @Expose({name: 'shuffle_questions'})
    shuffleQuestions?: boolean;

    @Expose({name: 'shuffle_answers'})
    shuffleAnswers?: boolean;

    @Expose({name: 'auto_submit'})
    autoSubmit?: boolean;

    @Expose({name: 'allow_review'})
    allowReview?: boolean;

    @Expose({name: 'show_result'})
    showResult?: boolean;

    @Expose({name: 'start_time'})
    startTime: Date;

    @Expose({name: 'end_time'})
    endTime: Date;

    @Expose({name: 'attempt_limit'})
    attemptLimit: number;

    @Expose({name: 'session_status'})
    sessionStatus: SessionStatus;

    @Expose()
    @Type(() => ClassInfo)
    @Transform(({obj}) => 
        obj.exam_session_class.map(i => i.classes))
    classesInfo?: ClassInfo[];
}

class ClassInfo {
    @Expose({name: 'class_id'})
    classId: number;

    @Expose({name: 'class_name'})
    className: string;
}

export class PaginatedSessionDto 
{
    @Expose()
    @Type(() => ExamSessionResponseDto)
    data: ExamSessionResponseDto[];

    @Expose()
    @Type(() => PaginationMetaDto)
    pagination: PaginationMetaDto;
}

export class QuerySessionDto {
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
    
    @IsOptional()
    @IsEnum(SessionStatus)
    status?: SessionStatus;
    
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    classId?: number;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startFrom?: Date;
    
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startTo?: Date;
}