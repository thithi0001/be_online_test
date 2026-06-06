import { PartialType } from "@nestjs/swagger";
import { IsInt, IsIP, IsNotEmpty, IsObject} from "class-validator";

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
}

export class UpdateAttemptDto 
    extends PartialType(CreateAttemptDto) {}
