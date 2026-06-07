import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseFilters, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ClassService } from "./class.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { AddOneStudentDto, AddStudentsDto, CreateClassDto, ImportStudentDto } from "./dto/class.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { ClassMemberResponseDto, ClassRespsonseDto, PaginatedClassDto, QueryClassDto } from "./dto/class-respsonse.dto";
import { PaginatedUserDto, QueryUserDto } from "../user/dto/user-response.dto";

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
    constructor(private readonly classService: ClassService) {
        
    }

    @Post()
    @Roles(Role.TEACHER)
    @Serialize(ClassRespsonseDto)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateClassDto,
    ) {
        return this.classService.create(user.userId, dto);
    }

    @Get()
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(PaginatedClassDto)
    getMany(
        @CurrentUser() user: any,
        @Query() query: QueryClassDto,
    ) {
        return this.classService.getMany(user.userId, user.role, query);
    }

    @Get(':id')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(ClassRespsonseDto)
    getById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.classService.getById(user.userId, user.role, id);
    }

    @Patch(':id')
    @Roles(Role.TEACHER)
    @Serialize(ClassRespsonseDto)
    update(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() body: any
    ) {
        if (!body.newClassName) {
            throw new BadRequestException('Tên lớp không được để trống.');
        }

        return this.classService.update(user.userId, id, body.newClassName);
    }

    // thêm 1 sinh viên
    @Post(':id')
    @Roles(Role.TEACHER)
    @Serialize(ClassMemberResponseDto)
    addOneStudent(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: AddOneStudentDto,
    ) {
        return this.classService.addOneStudent(user.userId, id, dto.email);
    }

    // thêm từ danh sách
    @Post(':id/bulk')
    @Roles(Role.TEACHER)
    @Serialize(ClassMemberResponseDto)
    addStudents(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dtos: ImportStudentDto[],
    ) {
        return this.classService.addStudents(user.userId, id, dtos);
    }

    @Get(':id/members')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(PaginatedUserDto)
    getMembers(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Query() query: QueryUserDto,
    ) {
        return this.classService.getClassMembers(user.userId, user.role, id, query);
    }
}