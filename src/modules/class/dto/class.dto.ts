import { PartialType } from "@nestjs/swagger";
import { ArrayNotEmpty, IsArray, IsEmail, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateClassDto {
    @IsString()
    @IsNotEmpty()
    className: string;
}

export class UpdateClassDto 
    extends PartialType(CreateClassDto) {}

export class AddStudentsDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    studentIds: number[];
}

export class AddOneStudentDto {
    @IsEmail()
    email: string;
}

export class ImportStudentDto {
    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsEmail()
    email: string;
}