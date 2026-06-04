import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { CreateExamTemplateDto, CreateTemplateQuestionDto, UpdateExamTemplateDto, UpdateTemplateQuestionDto } from "./dto/examTemplate.dto";
import { QueryTemplateDto } from "./dto/examTemplate-response.dto";
import { Role } from "@/common/enums/role.enum";

@Injectable()
export class ExamTemplateService {
    constructor(private prisma: PrismaService) {}

    async validateTeacherOwnership(
        teacherId: number,
        templateId: number,
    ) {
        const existed = await this.prisma.exam_templates.findFirst({
            where: {
                created_by: teacherId,
                template_id: templateId,
            },
            select: {
                template_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý đề.');
    }

    async validateAndReturn(
        teacherId: number,
        templateId: number,
    ) {
        const existed = await this.prisma.exam_templates.findFirst({
            where: {
                created_by: teacherId,
                template_id: templateId,
            },
        });

        if (!existed)
            throw new ForbiddenException('Không có quyền quản lý đề.');

        return existed;
    }

    async validateTemplate(
        templateId: number,
    ) {
        const count = await this.prisma.exam_template_questions.count({
            where: {
                template_id: templateId,
                question_banks: {
                    is_active: false,
                },
            },
        });

        if (count > 0)
            throw new BadRequestException('Đề thi không hợp lệ.');
    }

    async validateTemplateQuestions(
        questionIds: number[],
    ) {
        /**
         * kiểm tra trong số câu hỏi được đưa vào có câu nào không hợp lệ 
         */
        const count = await this.prisma.question_banks.count({
            where: {
                question_id: { in: questionIds },
                is_active: false,
            },
        });

        if (count > 0)
            throw new BadRequestException('Đề thi chứa câu hỏi không hợp lệ.');
    }

    async isUsed(
        templateId: number,
    ) {
        const used = await this.prisma.exam_sessions.findFirst({
            where: {
                template_id: templateId,
            },
            select: {
                template_id: true,
            },
        });

        return !!used;
    }

    async create(
        teacherId: number,
        dto: CreateExamTemplateDto,
        questions?: CreateTemplateQuestionDto[],
    ) {
        // không cho phép tạo đề nếu không có câu hỏi
        if (!questions || questions.length < 1)
            throw new BadRequestException('Đề thi cần phải chứa câu hỏi.');
        
        // không cho phép tạo đề nếu chứa câu hỏi không hợp lệ
        const ids = questions.map((q) => q.questionId);
        await this.validateTemplateQuestions(ids);

        const template = await this.prisma.exam_templates.create({
            data: {
                created_by: teacherId,
                sub_id: dto.subjectId,
                template_name: dto.templateName,
            },
        });

        await this.updateQuestions(template.template_id, questions);

        return template;
    }

    async update(
        teacherId: number,
        templateId: number,
        dto: UpdateExamTemplateDto,
        questions?: CreateTemplateQuestionDto[],
    ) {
        await this.validateTeacherOwnership(teacherId, templateId);

        // nếu đề thi đã được sử dụng thì không cho phép sửa đề cũ
        if (await this.isUsed(templateId))
            throw new BadRequestException('Không được phép chỉnh sửa đề thi.');

        await this.updateQuestions(templateId, questions);

        return await this.prisma.exam_templates.update({
            where: {
                template_id: templateId,
            },
            data: {
                template_name: dto.templateName,
                sub_id: dto.subjectId,
            },
        });
    }

    async upsert(

    ) {
        
    }

    private async updateQuestions(
        templateId: number,
        questions?: CreateTemplateQuestionDto[],
    ) {
        if (!questions || questions.length < 1) 
            return;

        await this.prisma.$transaction([
            this.prisma.exam_template_questions.deleteMany({
                where: {
                    template_id: templateId,
                },
            }),
            
            this.prisma.exam_template_questions.createMany({
                data: questions.map((q) => ({
                    template_id: templateId,
                    question_id: q.questionId,
                    score: q.score,
                    order_index: q.orderIndex,
                })),
            }),
        ]);
    }

    async getQuestions(
        templateId: number,
        show?: boolean,
    ) {
        /**
         * 1. hiển thị cho đề thi
         * 1.1. gv xem, sửa, xóa đề -> xem hết thuộc tính
         * 1.2. sv xem đề để làm bài -> ẩn isCorrect
         * 2. hiển thị cho lịch sử làm bài
         * 2.1. sau khi làm xong, nhưng chưa được phép xem đáp án đúng đối với sv -> ẩn
         * 2.2. được phép xem toàn bộ -> xem hết thuộc tính
         */

        const orderByIndex = {
            order_index: 'asc' as const,
        };

        const answerConfig =  {
            select: {
                answer_id: true,
                ...(show && { is_correct: true }),
                m_content: true,
                order_index: true,
            },
            orderBy: orderByIndex,
        };

        const questionConfig = {
            select: {
                q_type: true,
                m_content: true,
                is_active: true, // dùng kiểm tra tính hợp lệ
                answer_banks: answerConfig,
            },
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.exam_template_questions.findMany({
                where: {
                    template_id: templateId,
                },
                select: {
                    question_id: true,
                    score: true,
                    order_index: true,
                    question_banks: questionConfig,
                },
                orderBy: orderByIndex,
            }),
            
            this.prisma.exam_template_questions.count({ 
                where: {
                    template_id: templateId,
                },
            }),
        ]);            

        return {
            data,
            total
        };
    }

    async softDelete(
        teacherId: number,
        templateId: number,
        isValidated?: boolean,
    ) {
        if (!isValidated)
            await this.validateTeacherOwnership(teacherId, templateId);

        return await this.prisma.exam_templates.update({
            where: {
                template_id: templateId,
            },
            data: {
                is_active: false,
            },
        });
    }

    async delete(
        teacherId: number,
        templateId: number,
    ) {
        if (await this.isUsed(templateId))
            return await this.softDelete(teacherId, templateId);

        await this.validateTeacherOwnership(teacherId, templateId);

        await this.prisma.$transaction([
            this.prisma.exam_template_questions.deleteMany({
                where: {
                    template_id: templateId,
                },
            }),

            this.prisma.exam_templates.delete({
                where: {
                    template_id: templateId,
                },
           }),
        ]);

        return {
            message: 'Đã xóa đề thi.'
        };
    }

    async getById(
        userId: number,
        role: Role,
        templateId: number,
    ) {
        
    }

    async getMany(
        teacherId: number,
        query: QueryTemplateDto
    ) {
        const {
            keyword,
            page = 1,
            limit = 1,
            createdBy,
            subjectId
        } = query;

        const where = {
            created_by: teacherId,
            ...(keyword && { template_name: { contains: keyword } }),
            ...(subjectId && { sub_id: subjectId }),
            is_active: true,
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.exam_templates.findMany({
                where,
                omit: {
                    created_at: true,
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {template_name: 'asc'},
            }),

            this.prisma.exam_templates.count({ where }),
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