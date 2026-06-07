import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateNotiDto {
    @IsInt()
    createdBy: number;

    @IsString()
    @IsNotEmpty()
    content: string;
}