import { BadRequestException, ForbiddenException, Injectable} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateClassDto, ImportStudentDto } from "./dto/class.dto";
import { Role } from "@/common/enums/role.enum";
import { QueryClassDto } from "./dto/class-respsonse.dto";
import { QueryUserDto } from "../user/dto/user-response.dto";
import { NotificationService } from "../notification/notification.service";
import { UserService } from "../user/users.service";

@Injectable()
export class ClassService {
    // kiểm tra ownership
    /**
     * tạo lớp học
     * thêm sinh viên vào lớp
     * xem danh sách lớp
     */

    constructor(
        private prisma: PrismaService,
        private notiService: NotificationService,
        private userService: UserService,
    ) {}

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
            throw new ForbiddenException('Không có quyền quản lý hoặc lớp học không tồn tại.');
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
            include: {
                _count: { select: { student_class: true,},},
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý hoặc lớp học không tồn tại.');

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
            throw new ForbiddenException('Không có quyền tham gia hoặc lớp học không tồn tại.');
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
            include: {
                _count: { select: { student_class: true,},},
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền tham gia hoặc lớp học không tồn tại.');

        return existed;
    }

    async create(
        teacherId: number,
        dto: CreateClassDto,
    ) {
        return await this.prisma.classes.create({
            data: {
                teacher_id: teacherId,
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
            include: {
                _count: { select: { student_class: true,},},
            },
        });
    }

    async addOneStudent(
        teacherId: number,
        classId: number,
        email: string,
    ) {
        await this.validateTeacherOwnerShip(teacherId, classId);

        const student = await this.prisma.users.findUnique({
            where: { email: email },
            select: {
                user_id: true,
                email: true,
                full_name: true, 
                role: true,
            },
        });

        // trường hợp sinh viên chưa tạo tài khoản 
        if (!student) {
            await this.prisma.class_invitations.create({
                data: {
                    class_id: classId,
                    email: email,
                    invited_by: teacherId,
                },
            });

            return {
                message: 'Sinh viên chưa đăng ký tài khoản, đã gửi lời mời.',
            };
        }
            
        // không phải tài khoản student
        if (student.role !== Role.STUDENT) 
            throw new BadRequestException('Người dùng không phải sinh viên.');
            
        const data = await this.prisma.student_class.create({
            data: {
                class_id: classId,
                student_id: student.user_id,
            },
            include: {
                classes: { select: { class_name: true },},
            },
        });

        await this.notiService.create(
            {
                content: `Bạn đã được thêm vào lớp ${data.classes.class_name}.`,
                createdBy: teacherId,
            },
            [student.user_id],
        );

        return student;
    }

    async addStudents(
        teacherId: number,
        classId: number,
        // danh sách đã được lọc
        dtos: ImportStudentDto[],
    ) {
        const _class = await this.validateAndReturnForTeacher(teacherId, classId);

        const { studentIds, invitedEmails } = await this.resolveStudents(dtos.map(dto => dto.email));

        await this.prisma.class_invitations.createMany({
            data: invitedEmails.map(email => ({
                class_id: classId,
                email: email,
                invited_by: teacherId,
            })),
        });

        await this.prisma.student_class.createMany({
            data: studentIds.map((id) => ({
                class_id: classId,
                student_id: id,
            })),
        });

        await this.notiService.create(
            {
                content: `Bạn đã được thêm vào lớp ${_class.class_name}.`,
                createdBy: teacherId,
            },
            studentIds,
        );

        return await this.userService.getMany(studentIds, {});
    }

    async resolveStudents(
        emails: string[],
    ) {
        const users = await this.prisma.users.findMany({
            where: {
                email: { in: emails,},
                role: 'student',
                is_active: true,
            },
            select: {
                user_id: true,
                email: true,
            },
        });

        const studentIds = users.map(u => u.user_id);

        const registeredEmails = new Set(
            users.map(u => u.email.toLowerCase()),
        );

        const invitedEmails = emails.filter(
            email => !registeredEmails.has(email.toLowerCase()),
        );

        return {
            studentIds,
            invitedEmails,
        };
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
                    include: {
                        _count: { select: { student_class: true,},},
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
                include: {
                    _count: { select: { student_class: true,},},
                },
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