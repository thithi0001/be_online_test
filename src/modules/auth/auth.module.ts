import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { PrismaService } from "@/prisma/prisma.service";
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const secretKey = configService.get<string>('JWT_SECRET'); 
            
            // 👇 Ép kiểu đoạn này về 'any' để TypeScript không bắt bẻ cấu trúc StringValue nữa
            const expiresInTime = configService.get<string>('JWT_EXPIRE_IN') || '12h';

            if (!secretKey) {
                throw new Error('CẢNH BÁO CHÍ MẠNG: Không tìm thấy biến JWT_SECRET trong file .env!');
            }

            return {
                secret: secretKey,
                signOptions: {
                    expiresIn: expiresInTime as any, // <-- THÊM CHỮ "as any" VÀO ĐÂY LÀ XONG KHÓA CHÍ MẠNG!
                },
            };
        },
    }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        PrismaService,
    ],
    exports: [AuthService],
})
export class AuthModule {}