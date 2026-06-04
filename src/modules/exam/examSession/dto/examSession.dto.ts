import { SessionStatus } from "@/common/enums/statuses.enum";
import { PartialType } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsString } from "class-validator";

export class CreateExamSessionDto {
    @IsNumber()
    sessionId?: number;
    
    @IsNumber()
    templateId: number;
    
    @IsNumber()
    createdBy: number;
    
    @IsString()
    sessionName: string;
    
    @IsNumber()
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
    
    @IsNumber()
    attemptLimit?: number;
    
    @IsString()
    sessionPassword: string;
    
    @IsEnum(SessionStatus)
    sessionStatus: SessionStatus;

    @IsArray()
    @IsNumber()
    classIds?: number[];
}

export class UpdateExamSessionDto 
    extends PartialType(CreateExamSessionDto){}