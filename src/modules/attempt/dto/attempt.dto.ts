import { PartialType } from "@nestjs/swagger";
import { IsInt, IsIP, IsNotEmpty, IsObject, IsString} from "class-validator";

export class CreateAttemptDto {
    @IsInt()
    attemptId?: number;

    @IsInt()
    studentId: number;

    @IsInt()
    sessionId: number;

    @IsIP()
    ipAddress: string;

    @IsObject()
    @IsNotEmpty()
    deviceInfo: Record<string, any>;

    @IsString()
    @IsNotEmpty()
    sessionPassword: string;
}

export class UpdateAttemptDto 
    extends PartialType(CreateAttemptDto) {}
