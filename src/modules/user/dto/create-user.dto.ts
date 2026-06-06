import { Role } from '@/common/enums/role.enum';
import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(Role)
  role: Role;
}

export class UpdateUserDto 
  extends PartialType(CreateUserDto) {}