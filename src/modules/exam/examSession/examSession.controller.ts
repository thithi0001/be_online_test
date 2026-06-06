import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "@/modules/auth/guards/roles.guard";
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ExamSessionService } from "./examSession.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { CreateExamSessionDto, UpdateExamSessionDto } from "./dto/examSession.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ExamSessionResponseDto, PaginatedSessionDto, QuerySessionDto } from "./dto/examSession-response.dto";

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
    constructor(private readonly sessionService: ExamSessionService) {}

    @Post()
    @Roles(Role.TEACHER)
    @Serialize(ExamSessionResponseDto)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateExamSessionDto
    ) {
        return this.sessionService.create(user.userId, dto);
    }

    @Patch(':id')
    @Roles(Role.TEACHER)
    @Serialize(ExamSessionResponseDto)
    update(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateExamSessionDto,
    ) {
        return this.sessionService.update(user.userId, id, dto);
    }

    @Get()
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(PaginatedSessionDto)
    getMany(
        @CurrentUser() user: any,
        @Query() query: QuerySessionDto,
    ) {
        return this.sessionService.getMany(user.userId, user.role, query);
    }

    @Get(':id')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(ExamSessionResponseDto)
    getById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.sessionService.getById(user.userId, user.role, id);
    }


    @Delete(':id')
    @Roles(Role.TEACHER)
    delete(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.sessionService.delete(user.userId, id);
    }

    



}



