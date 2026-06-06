import { IsDate, IsInt, IsNotEmpty, IsString, Min } from "class-validator";

export class CreateRetakeDto {
    @IsInt()
    sessionId: number;

    @IsString()
    @IsNotEmpty()
    reason: string;
}

export class CreatePermissionDto {
    @IsInt()
    requestId: number;
    
    @IsDate()
    availableFrom: Date;
    
    @IsDate()
    availableTo: Date;
    
    @IsInt()
    @Min(1)
    attemptLimit: number;
}