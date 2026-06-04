import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { PrismaService } from "@/prisma/prisma.service";
import { Role } from "@/common/enums/role.enum";

@Injectable()
export class AuthService {
    constructor (
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async login(dto: LoginDto) {
        /**
         * input
         * mail address
         * password
         */

        /**
         * check mail address
         * hash password --> check hashed password
         */

        /**
         * authorize if verified
         * reject if not verified
         */

        const user = await this.prisma.users.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user)
            throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');

        const isPasswordMatched = await bcrypt.compare(
            dto.password,
            user.hashed_password,
        );

        if (!isPasswordMatched) 
            throw new UnauthorizedException('Tài khoản hoặc mật khẩu không đúng');

        const payload = {
            userId: user.user_id,
            email: user.email,
            role: user.role,
        };

        return {
            accessToken: await this.jwtService.signAsync(payload),
        };
    }
    
    async register(dto: RegisterDto) {
        /**
         * input
         * role
         * user's information
         * student code if is student
         * password
         */

        /**
         * validate mail address (for demo don't have to exist)
         * validate password
        */
       
        /**
         * hash password
         * register new user in database
         */

        const existedUser = await this.prisma.users.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (existedUser)
            throw new BadRequestException('Email đã được đăng ký.');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.users.create({
            data: {
                email: dto.email,
                full_name: dto.fullName,
                hashed_password: hashedPassword,
                role: dto.role,
            },
        });

        const payload = {
            userId: user.user_id,
            email: user.email,
            role: user.role,
        };

        return {
            accessToken: await this.jwtService.signAsync(payload),
        };
    }

    resetPasswordRequest() {
        /**
         * input
         * user's id or mail address
         * current password --> hash
         */

        /**
         * check hashed password
         * grant permission to reset password
         */
        
    }

    resetPassword() {
        /**
         * input
         * new password
         */

        /**
         * validate password
         * hash password
         * alter new hashed password to the database
         * update updated_at
         */
    }

}