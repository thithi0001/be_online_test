import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseFilters, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { SubjectService } from "./subject.service";
import { PaginatedSubjectDto, QuerySubjectDto, SubjectResponseDto } from "./dto/subject.dto";

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) {}

    @Post()
    @Roles(Role.TEACHER)
    @Serialize(SubjectResponseDto)
    create(
        @CurrentUser() user: any,
        @Body() subjectName: string,
    ) {
        if (!subjectName) {
            throw new BadRequestException('Tên môn học không được để trống.');
        }

        return this.subjectService.create(user.userId, subjectName);
    }

    @Get()
    @Roles(Role.TEACHER)
    @Serialize(PaginatedSubjectDto)
    getMany(
        @CurrentUser() user: any,
        @Query() query: QuerySubjectDto,
    ) {
        return this.subjectService.getMany(user.userId, query);
    }

    @Get(':id')
    @Roles(Role.TEACHER)
    @Serialize(SubjectResponseDto)
    getById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.subjectService.getById(user.userId, id);
    }

    @Patch(':id')
    @Roles(Role.TEACHER)
    @Serialize(SubjectResponseDto)
    update(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() newSubjectName: string,
    ) {
        if (!newSubjectName) {
            throw new BadRequestException('Tên môn học không được để trống.');
        }

        return this.subjectService.update(user.userId, id, newSubjectName);
    }
}
