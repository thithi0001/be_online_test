import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) {}
    
    async validateUserOwnership(
        userId: number,
        notiId: number,
    ) {
        const existed = await this.prisma.noti_users.findFirst({
            where: {
                user_id: userId,
                noti_id: notiId,
            },
        });

        if (!existed)
            throw new NotFoundException('Không tìm thấy thông báo.');
    }

    async validateAndReturn(
        userId: number,
        notiId: number,
    ) {
        const existed = await this.prisma.notifications.findFirst({
            where: {
                noti_id: notiId,
                noti_users: { some: { user_id: userId },},
            },
            include: {
                noti_users: { select: { is_read: true },},
            },
        });

        if (!existed)
            throw new NotFoundException('Không tìm thấy thông báo.');

        return existed;
    }

    // hệ thống tạo
    async create(
        dto: any,
        userIds: number[],
    ) {
        return await this.prisma.$transaction([
            this.prisma.notifications.create({
                data: {
                    m_content: dto.content,
                    created_by: dto.createdBy,
                    noti_users: {
                        create: userIds.map(id => ({
                            user_id: id,
                        })),
                    },
                },
            }),
        ]);
    }

    async update(
        userId: number,
        notiId: number,
    ) {
        await this.prisma.noti_users.updateMany({
            where: {
                noti_id: notiId,
                user_id: userId,
                is_read: false,
            },
            data: {
                is_read: true,
            },
        });

        return {
            message: 'Đã đánh dấu đã đọc.'
        };
    }

    async getById(
        userId: number,
        notiId: number,
    ) {
        return await this.validateAndReturn(userId, notiId);
    }

    async getMany(
        userId: number,
        query: any,
    ) {
        const {
            keyword,
            page = 1,
            limit = 10,
            isRead,
        } = query;
        
        const where = {
            noti_users: { some: { user_id: userId },},
            ...(keyword && { m_content: { contains: keyword },}),
            ...(isRead !== undefined && { is_read: isRead }),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.notifications.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { 
                    created_at: 'desc',
                },
                include: {
                    noti_users: { select: { is_read: true },},
                },
            }),

            this.prisma.notifications.count({ where }),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };

    }

}