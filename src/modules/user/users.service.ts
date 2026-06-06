import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ChangePasswordDto } from "./dto/change-password.dto";
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from "./dto/create-user.dto";
import { QueryUserDto } from "./dto/user-response.dto";

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService,) {
        
    }

    private userPayLoad = {
        user_id: true,
        email: true,
        full_name: true,
        role: true,
    };

    async create(dto: CreateUserDto) {
        const existed = await this.prisma.users.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (existed)
            throw new ConflictException('Tài khoản đã được đăng ký.');

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.users.create({
            data: {
                email: dto.email,
                full_name: dto.fullName,
                hashed_password: hashedPassword,
                role: dto.role,
            },
            select: this.userPayLoad,
        });

        return user;
    }

    async getOneByEmail(email: string) {
        const user = await this.prisma.users.findUnique({
            where: {
                email: email,
            },
            select: this.userPayLoad,
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng.');
        }
        
        return user;
    }

    async getById(id: number) {
        const user = await this.prisma.users.findUnique({
            where: {
                user_id: id,
            },
            select: this.userPayLoad,
        });

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng.');
        }

        return user;
    }

    async update(
        id: number, 
        dto: UpdateUserDto
    ) {
        return await this.prisma.users.update({
            where: {
                user_id: id,
            },
            data: {
                full_name: dto.fullName
            },
            select: this.userPayLoad,
        });
    }

    async getMany(
        ids: number[],
        query: QueryUserDto
    ) {
        const {keyword, page = 1, limit = 10} = query;

        const where = {
            user_id: { in: ids },
            ...(keyword && { full_name: { contains: keyword } }),
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.users.findMany({
                where,
                select: this.userPayLoad,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {full_name: 'asc',},
            }),

            this.prisma.users.count({ where }),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async changePassword(
        userId: number,
        dto: ChangePasswordDto,
    ) {
        const user = await this.prisma.users.findUnique({
            where: {
                user_id: userId,
            },
        });

        if (!user)
            throw new UnauthorizedException();

        const isPasswordMatched = await bcrypt.compare(
            dto.currentPassword,
            user.hashed_password
        );

        if (!isPasswordMatched)
            throw new BadRequestException('Mật khẩu hiện tại sai.');

        const isSamePassword = await bcrypt.compare(
            dto.newPassword,
            user.hashed_password
        );

        if (isSamePassword)
            throw new BadRequestException('Mật khẩu mới phải khác mật khẩu cũ.');

        const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.users.update({
            where: {
                user_id: userId,
            },
            data: {
                hashed_password: newHashedPassword,
            },
        });

        return {
            message: 'Đổi mật khẩu thành công.',
        };
    }
}