import { PrismaService } from "@/prisma/prisma.service";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { QuerySubjectDto } from "./dto/subject.dto";

@Injectable()
export class SubjectService {
    constructor(private prisma: PrismaService) {}

    async validateTeacherOwnership(
        teacherId: number,
        subjectId: number,
    ) {
        const existed = await this.prisma.subjects.findFirst({
            where: {
                created_by: teacherId,
                sub_id: subjectId,
            },
            select: {
                sub_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý môn học.');
    }
    
    async validateAndReturn(
        teacherId: number,
        subjectId: number,
    ) {
        const existed = await this.prisma.subjects.findFirst({
            where: {
                created_by: teacherId,
                sub_id: subjectId,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý môn học.');

        return existed;
    }
    
    async create(
        teacherId: number,
        subjectName: string,
    ) {
        return await this.prisma.subjects.create({
            data: {
                created_by: teacherId,
                sub_name: subjectName,
            },
        });
    }

    async getById(
        teacherId: number,
        subjectId: number,
    ) {
        return await this.validateAndReturn(teacherId, subjectId);
    }

    async getMany(
        teacherId: number,
        query: QuerySubjectDto,
    ) {
        const {
            keyword, 
            page = 1, 
            limit = 10, 
            createdBy
        } = query;

        const where = {
            created_by: teacherId,
            ...(keyword && { sub_name: { contains: keyword } }),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.subjects.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {sub_name: 'asc'},
            }),

            this.prisma.subjects.count({ where }),
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

    async update(
        teacherId: number,
        subjectId: number,
        newSubjectName: string,
    ) {
        await this.validateTeacherOwnership(teacherId, subjectId);

        return await this.prisma.subjects.update({
            where: {
                sub_id: subjectId,
            },
            data: {
                sub_name: newSubjectName,
            },
        });
    }

}