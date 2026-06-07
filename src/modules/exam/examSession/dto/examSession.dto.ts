import { SessionStatus } from "@/common/enums/statuses.enum";
import { PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateExamSessionDto {
    @IsInt()
    sessionId?: number;
    
    @IsInt()
    templateId: number;
    
    @IsInt()
    createdBy: number;
    
    @IsString()
    sessionName: string;
    
    @IsInt()
    duration: number;
    
    @IsBoolean()
    shuffleQuestions?: boolean;
    
    @IsBoolean()
    shuffleAnswers?: boolean;
    
    @IsBoolean()
    autoSubmit?: boolean;
    
    @IsBoolean()
    allowReview?: boolean;
    
    @IsBoolean()
    showResult?: boolean;
    
    @IsDate()
    startTime: Date;
    
    @IsDate()
    endTime: Date;
    
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