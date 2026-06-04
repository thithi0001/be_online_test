import { AttemptStatus } from "@/common/enums/statuses.enum";
import { PartialType } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEnum, IsJSON, IsNumber, IsString } from "class-validator";

export class CreateAttemptDto {
    @IsNumber()
    attemptId?: number;

    @IsNumber()
    studentId: number;

    @IsNumber()
    sessionId: number;

    @IsString()
    ipAddress: string;

    @IsJSON()
    deviceInfo: object;

    @IsEnum(AttemptStatus)
    attemptStatus?: AttemptStatus;

    @IsDate()
    startTime: Date;

    @IsDate()
    submitTime: Date;

    @IsNumber()
    totalScore: number;
}

export class UpdateAttemptDto 
    extends PartialType(CreateAttemptDto) {}

export class CreateStudentAnswerDto {
    @IsNumber()
    questionId: number;
    
    @IsNumber()
    answerId: number;
}