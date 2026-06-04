import { Role } from '@/common/enums/role.enum';
import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsString()
  fullName: string;

  @IsEnum(Role)
  role: Role;
}

export class UpdateUserDto 
  extends PartialType(CreateUserDto) {}