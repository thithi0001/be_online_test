import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/modules/auth/guards/roles.guard";
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ExamTemplateService } from "./examTemplate.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { ExamTemplateResponseDto, PaginatedTemplateDto, QueryTemplateDto, TemplateQuestionArrayResponseDto } from "./dto/examTemplate-response.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CreateExamTemplateDto, CreateTemplateQuestionDto, UpdateExamTemplateDto } from "./dto/examTemplate.dto";

@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplateController {
    constructor(private readonly templateService: ExamTemplateService) {}

    @Post()
    @Roles(Role.TEACHER)
    @Serialize(ExamTemplateResponseDto)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateExamTemplateDto,
    ) {
        return this.templateService.create(user.userId, dto);
    }

    @Patch(':id')
    @Roles(Role.TEACHER)
    @Serialize(ExamTemplateResponseDto)
    update(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateExamTemplateDto,
    ) {
        return this.templateService.update(user.userId, id, dto);
    }

    @Get()    
    @Roles(Role.TEACHER)
    @Serialize(PaginatedTemplateDto)
    getMany(
        @CurrentUser() user: any,
        @Query() query: QueryTemplateDto,
    ) {
        return this.templateService.getMany(user.userId, query);
    }

    @Get(':id')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(ExamTemplateResponseDto)
    getById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.templateService.getById(user.userId, user.role, id);
    }
    
    @Delete(':id')
    @Roles(Role.TEACHER)
    delete(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.templateService.delete(user.userId, id);
    }

    @Get(':id')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(TemplateQuestionArrayResponseDto)
    getQuestions(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.templateService.getQuestions(user.role, id);
    }

}
