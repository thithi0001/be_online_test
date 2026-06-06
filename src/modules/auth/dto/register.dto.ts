import { Role } from '@/common/enums/role.enum';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}