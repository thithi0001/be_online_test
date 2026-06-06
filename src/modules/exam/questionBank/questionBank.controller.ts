import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/modules/auth/guards/roles.guard";
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { QuestionBankService } from "./questionBank.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CreateQuestionBankDto, UpdateQuestionBankDto } from "./dto/question.dto";
import { PaginatedQuestionDto, QueryQuestionDto, QuestionResponseDto } from "./dto/question-response.dto";
import { Serialize } from "@/common/decorators/serialize.decorator";

@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuestionController {
    constructor(private readonly questionService: QuestionBankService) {}

    @Post()
    @Roles(Role.TEACHER)
    @Serialize(QuestionResponseDto)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateQuestionBankDto,
    ) {
        return this.questionService.create(user.userId, dto);
    }

    @Post('bulk')
    @Roles(Role.TEACHER)
    @Serialize(QuestionResponseDto)
    createMany(
        @CurrentUser() user: any,
        @Body() dtos: CreateQuestionBankDto[],
    ) {
        return this.questionService.createMany(user.userId, dtos);
    }

    @Patch(':id')
    @Roles(Role.TEACHER)
    @Serialize(QuestionResponseDto)
    update(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateQuestionBankDto,
    ) {
        return this.questionService.update(user.userId, id, dto);
    }

    @Delete(':id')
    @Roles(Role.TEACHER)
    delete(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.questionService.delete(user.userId, id);
    }

    @Get()
    @Roles(Role.TEACHER)
    @Serialize(PaginatedQuestionDto)
    getMany(
        @CurrentUser() user: any,
        @Query() query: QueryQuestionDto,
    ) {
        return this.questionService.getMany(user.userId, query);
    }

    @Get(':id')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(QuestionResponseDto)
    getById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.questionService.getById(user.userId, id);
    }
}
