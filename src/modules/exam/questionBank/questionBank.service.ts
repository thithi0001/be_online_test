import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { CreateAnswerBankDto, CreateQuestionBankDto, UpdateAnswerBankDto, UpdateQuestionBankDto } from "./dto/question.dto";
import { QueryQuestionDto } from "./dto/question-response.dto";
import { QuestionType } from "@/common/enums/questionType.enum";
import { answer_banks, question_banks_q_type } from "@prisma/client";

type action = 'create' | 'update' | 'delete'
@Injectable()
export class QuestionBankService {
    constructor(private prisma: PrismaService) {}

    async validateTeacherOwnership(
        teacherId: number,
        questionId: number,
    ) {
        const existed = await this.prisma.question_banks.findFirst({
            where: {
                created_by: teacherId,
                question_id: questionId,
            }, 
            select: {
                question_id: true,
            },
        });

        if (!existed)
            throw new ForbiddenException('[vto] Không có quyền quản lý hoặc câu hỏi không tồn tại.');
    }

    private omit = {
        created_at: true as const,
    }

    private orderByIndex = {
        orderBy: { order_index: 'asc' as const },
    }
    
    private hideAnswer = {
        select: {
            answer_id: true,
            m_content: true,
            order_index: true,
        },
        orderBy: { order_index: 'asc' as const },
    }

    async validateAndReturn(
        teacherId: number,
        questionId: number
    ) {
        const existed = await this.prisma.question_banks.findFirst({
            where: {
                created_by: teacherId,
                question_id: questionId,
            },
            omit: this.omit,
            include: {
                answer_banks: this.orderByIndex,
            },
        });

        if (!existed)
            throw new ForbiddenException('[var] Không có quyền quản lý hoặc câu hỏi không tồn tại.');

        return existed;
    }

    async validateQuestion(
        qType: QuestionType | question_banks_q_type,
        answers: any[],
    ) {
        const correctCount = answers.filter(a => 
            (a.isCorrect === true) || (a.is_correct === true)
        ).length;

        if (correctCount === 0)
            throw new BadRequestException('[vq] Câu hỏi phải có đáp án đúng.');

        if (answers.length < 2)
            throw new BadRequestException('[vq] Câu hỏi phải có từ 2 đáp án.')

        switch (qType) {
            case QuestionType.SINGLE:
            case QuestionType.TF:
                if (correctCount !== 1)
                    throw new BadRequestException('[vq] Câu hỏi chỉ được phép có 1 đáp án đúng.');
                break;

            case QuestionType.MULTIPLE:
                break;
        }
    }

    async isUsed(
        questionId: number
    ) {
        const used = await this.prisma.exam_template_questions.findFirst({
            where: {
                question_id: questionId,
            },
            select: {
                question_id: true,
            },
        });

        return !!used;
    }

    async create(
        teacherId: number,
        dto: CreateQuestionBankDto, 
    ) {
        await this.validateQuestion(dto.qType, dto.answers);

        return await this.prisma.question_banks.create({
            data: {
                sub_id: dto.subjectId,
                created_by: teacherId,
                q_type: dto.qType,
                m_content: dto.content,
                difficulty: dto.difficulty,
                answer_banks: {
                    create: dto.answers.map((a) => ({
                        is_correct: a.isCorrect,
                        m_content: a.content,
                        order_index: a.orderIndex
                    })),
                },
            },
            omit: this.omit,
            include: {
                answer_banks: this.orderByIndex,
            },
        });
    }

    async createMany(
        teacherId: number,
        dtos: CreateQuestionBankDto[], 
    ) {
        dtos.map(q => this.validateQuestion(q.qType, q.answers));

        return await this.prisma.$transaction(
            dtos.map((q) => 
                this.prisma.question_banks.create({
                    data: {
                        sub_id: q.subjectId,
                        created_by: teacherId,
                        q_type: q.qType,
                        m_content: q.content,
                        difficulty: q.difficulty,
                        // Nested Writes 
                        answer_banks: {
                            create: q.answers.map((a) => ({
                                is_correct: a.isCorrect,
                                m_content: a.content,
                                order_index: a.orderIndex,
                            })),
                        },
                    },
                    omit: this.omit,
                    include: {
                        answer_banks: this.orderByIndex,
                    },
                }),
            ),
        );
    }
    
    async update(
        teacherId: number,
        questionId: number,
        dto: UpdateQuestionBankDto,
    ) {
        if (await this.isUsed(questionId))
            throw new BadRequestException('[u] Không được phép chỉnh sửa câu hỏi.');

        const question = await this.validateAndReturn(teacherId, questionId);
        const qType : QuestionType = dto.qType ?? (question.q_type as QuestionType);
        const answers = dto.answers ?? question.answer_banks;

        await this.validateQuestion(qType, answers);

        if (!!dto.answers)
            await this.prisma.$transaction([
                this.prisma.answer_banks.deleteMany({
                    where: {
                        question_id: questionId,
                    },
                }),

                this.prisma.answer_banks.createMany({
                    data: dto.answers.map(a => ({
                        question_id: questionId,
                        is_correct: a.isCorrect,
                        m_content: a.content,
                        order_index: a.orderIndex,
                    })),
                }),
            ]);

        return await this.prisma.question_banks.update({
            where: {
                question_id: questionId,
            },
            data: {
                sub_id: dto.subjectId,
                q_type: dto.qType,
                m_content: dto.content,
                difficulty: dto.difficulty,
            },
            omit: this.omit,
            include: {
                answer_banks: this.orderByIndex,
            },
        });
    }

    async upsert(

    ) {
        
    }

    async softDelete(
        teacherId: number,
        questionId: number,
        isValidated?: boolean,
    ) {
        if (!isValidated)
            await this.validateTeacherOwnership(teacherId, questionId);

        return await this.prisma.question_banks.update({
            where: {
                question_id: questionId
            },
            data: {
                is_active: false,
            },
            select: {
                question_id: true,
            },
        });
    }

    async delete (
        teacherId: number,
        questionId: number,
    ) {
        if (await this.isUsed(questionId)) 
            return await this.softDelete(teacherId, questionId);

        await this.validateTeacherOwnership(teacherId, questionId);

        await this.prisma.$transaction([
            this.prisma.answer_banks.deleteMany({
                where: {
                    question_id: questionId,
                },
            }),
            
            this.prisma.question_banks.delete({
                where: {
                    question_id: questionId,
                },
            }),
        ]);
        
        return {
            message: 'Đã xóa câu hỏi.',
        };
    }

    async getById(
        teacherId: number,
        questionId: number,
    ) {
        return await this.validateAndReturn(teacherId, questionId);
    }

    // async getManyById(
    //     hide: boolean,
    //     questionIds?: number[],
    // ) {
    //     if (!(questionIds && questionIds.length > 0))
    //         return;

    //     const where = {
    //         question_id: { in: questionIds },
    //     };

    //     const select = {
    //         ...(hide && {
    //             question_id: true,
    //             q_type: true,
    //             m_content: true,
    //             answer_banks: this.hideAnswer,
    //         }),
    //     };

    //     const [data, total] = await this.prisma.$transaction([
    //         this.prisma.question_banks.findMany({
    //             where,
    //             select,
    //         }),

    //         this.prisma.question_banks.count({ where }),
    //     ]);

    //     return {
    //         data,
    //         total
    //     };
    // }

    async getMany(
        teacherId: number,
        query: QueryQuestionDto,
    ) {
        const {
            keyword,
            page = 1,
            limit = 10,
            subjectId,
            createdBy,
            qType,
            difficulty,
        } = query;

        const where = {
            ...(keyword && { m_content: { contains: keyword } }),
            ...(subjectId && { sub_id: subjectId }),
            ...(difficulty && { difficulty: difficulty }),
            // ...(createdBy && { created_by: createdBy }),
            ...(qType && { q_type: qType }),
            created_by: teacherId,
            is_active: true,
        };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.question_banks.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    difficulty: 'asc',
                },
                omit: this.omit,
                include: {
                    answer_banks: {
                        orderBy: {
                            order_index: 'asc',
                        },
                    },
                },
            }),

            this.prisma.question_banks.count({ where }),
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