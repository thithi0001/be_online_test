import { PartialType } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateClassDto {
    @IsNumber()
    classId?: number;

    @IsNumber()
    teacherId: number;
    
    @IsString()
    className: string;
}

export class UpdateClassDto 
    extends PartialType(CreateClassDto) {}