import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AttemptService } from "./attempt.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { AttemptResponseDto, AttemptWithAnswerResponseDto, PaginatedAttemptDto, QueryAttemptDto } from "./dto/attempt-response.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CreateAttemptDto } from "./dto/attempt.dto";

@Controller('attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttemptController {
    constructor(private readonly attemptService: AttemptService) {}

    @Post()
    @Roles(Role.STUDENT)
    @Serialize(AttemptResponseDto)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateAttemptDto,
    ) {
        return this.attemptService.create(user.userId, dto);
    }

    @Patch(':id')
    @Roles(Role.STUDENT)
    @Serialize(AttemptResponseDto)
    update(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
    ) {
        return this.attemptService.update(
            user.userId, 
            id, 
            body.newAnswerIds, 
            body.deleteAnswerIds);
    }

    @Patch(':id/submit')
    @Roles(Role.STUDENT)
    @Serialize(AttemptResponseDto)
    submit(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any,
    ) {
        return this.attemptService.submit(
            user.userId,
            id,
            body.newAnswerIds,
            body.deleteAnswerIds,
            body.status
        );
    }

    @Get('current')
    @Roles(Role.STUDENT)
    @Serialize(AttemptWithAnswerResponseDto)
    getCurrent(
        @CurrentUser() user: any,
    ) {
        return this.attemptService.getCurrent(user.userId);
    }

    @Get(':id')
    @Roles(Role.STUDENT, Role.TEACHER)
    @Serialize(AttemptWithAnswerResponseDto)
    getById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.attemptService.getById(user.userId, user.role, id);
    }

    @Get()
    @Roles(Role.STUDENT, Role.TEACHER)
    @Serialize(PaginatedAttemptDto)
    getMany(
        @CurrentUser() user: any,
        @Query() query: QueryAttemptDto,
    ) {
        return this.attemptService.getMany(user.userId, user.role, query);
    }

}