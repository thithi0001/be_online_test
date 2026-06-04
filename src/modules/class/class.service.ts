import { ForbiddenException, Injectable} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateClassDto } from "./dto/class.dto";
import { Role } from "@/common/enums/role.enum";
import { QueryClassDto } from "./dto/class-respsonse.dto";
import { QueryUserDto } from "../user/dto/user-response.dto";

@Injectable()
export class ClassService {
    // kiểm tra ownership
    /**
     * tạo lớp học
     * thêm sinh viên vào lớp
     * xem danh sách lớp
     */

    constructor(private prisma: PrismaService) {}

    async validateTeacherOwnerShip(
        teacherId: number,
        classId: number,
    ) {
        const existed = await this.prisma.classes.findFirst({
            where: {
                class_id: classId,
                teacher_id: teacherId,
            },
            select: {
                class_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý lớp.');
    }

    async validateAndReturnForTeacher(
        teacherId: number,
        classId: number,
    ) {
        const existed = await this.prisma.classes.findFirst({
            where: {
                class_id: classId,
                teacher_id: teacherId,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý lớp.');

        return existed;
    }

    async validateStudentOwnership(
        studentId: number,
        classId: number,
    ) {
        const existed = await this.prisma.student_class.findFirst({
            where: {
                class_id: classId,
                student_id: studentId,
            },
            select: {
                class_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền tham gia lớp.');
    }

    async validateAndReturnForStudent(
        studentId: number,
        classId: number,
    ) {
        const existed = await this.prisma.classes.findFirst({
            where: {
                class_id: classId,
                student_class: { some: { student_id: studentId },},
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền tham gia lớp.');

        return existed;
    }

    async create(
        dto: CreateClassDto,
    ) {
        return await this.prisma.classes.create({
            data: {
                teacher_id: dto.teacherId,
                class_name: dto.className,
            },
        });
    }

    async update(
        teacherId: number,
        classId: number,
        newName: string,
    ) {
        return await this.prisma.classes.update({
            where: {
                teacher_id: teacherId,
                class_id: classId,
            },
            data: {
                class_name: newName,
            },
        });
    }

    async addStudents(
        teacherId: number,
        classId: number,
        studentIds: number[],
    ) {
        await this.validateTeacherOwnerShip(teacherId, classId);

        return await this.prisma.student_class.createMany({
            data: studentIds.map((studentId) => ({
                class_id: classId,
                student_id: studentId,
            })),
        });
    }
    
    async getClassMembers(
        userId: number,
        role: Role,
        classId: number,
        query: QueryUserDto,
    ) {
        const {keyword, page = 1, limit = 10} = query;
        
        switch (role) {
            case Role.TEACHER:
                await this.validateTeacherOwnerShip(userId, classId);
                break;

            case Role.STUDENT:
                await this.validateStudentOwnership(userId, classId);
                break;

            default:
                return;
        }

        const where = {
            student_class: { some: { class_id: classId } },
            ...(keyword && { full_name: { contains: keyword } }),
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.users.findMany({
                where,
                select: {
                    user_id: true,
                    email: true,
                    full_name: true,
                    role: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { full_name: 'asc' },
            }),

            this.prisma.users.count({ where })
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

    async getById(
        userId: number,
        role: Role,
        classId: number,
    ) {
        switch (role) {
            case Role.TEACHER:
                await this.validateAndReturnForTeacher(userId, classId);

            case Role.STUDENT:
                await this.validateAndReturnForStudent(userId, classId);

            default:
                return await this.prisma.classes.findUnique({
                    where: {
                        class_id: classId,
                    },
                });
        }
    }

    async getMany(
        userId: number,
        role: Role,
        query: QueryClassDto,
    ) {
        const { keyword, page = 1, limit = 10 } = query;
        let where = {};

        switch (role) {
            case Role.TEACHER: {
                where = {
                    teacher_id: userId,
                    ...(keyword && { class_name: { contains: keyword } }),
                };
                break;
            }
            case Role.STUDENT: {
                where = {
                    student_class: {some: { student_id: userId } },
                    ...(keyword && { class_name: { contains: keyword } }),
                }
                break;
            }
            default: {
                // get all
                where = {
                    ...(keyword && { class_name: { contains: keyword } }),
                };
                break;
            }
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.classes.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { class_name: 'asc' },
            }),

            this.prisma.classes.count({ where }),
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
    
}