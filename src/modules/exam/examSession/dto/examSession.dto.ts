import { SessionStatus } from "@/common/enums/statuses.enum";
import { PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreateExamSessionDto {
    @IsInt()
    templateId: number;

    @IsString()
    sessionName: string;
    
    @IsInt()
    duration: number;
    
    @IsOptional()
    @IsBoolean()
    shuffleQuestions?: boolean;
    
    @IsOptional()
    @IsBoolean()
    shuffleAnswers?: boolean;
    
    @IsOptional()
    @IsBoolean()
    autoSubmit?: boolean;
    
    @IsOptional()
    @IsBoolean()
    allowReview?: boolean;
    
    @IsOptional()
    @IsBoolean()
    showResult?: boolean;
    
    @IsDate()
    startTime: Date;
    
    @IsDate()
    endTime: Date;
    
    @IsOptional()
    @IsInt()
    @Min(1)
    attemptLimit?: number;
    
    @IsString()
    @IsNotEmpty()
    sessionPassword: string;
    
    @IsEnum(SessionStatus)
    sessionStatus: SessionStatus;

    @IsArray()
    @IsInt({ each: true })
    classIds: number[];
}

export class UpdateExamSessionDto 
    extends PartialType(CreateExamSessionDto){}