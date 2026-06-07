import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RetakeService } from "./retake.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { PaginatedPermissionDto, PaginatedRetakeDto, PermissionResponseDto, QueryPermissionDto, QueryRetakeDto, RetakeResponseDto } from "./dto/retake-response.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CreatePermissionDto, CreateRetakeDto } from "./dto/retake.dto";

@Controller('retakes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RetakeController {
    constructor(private readonly retakeService: RetakeService) {}

    @Post()
    @Roles(Role.STUDENT)
    @Serialize(RetakeResponseDto)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateRetakeDto,
    ) {
        return this.retakeService.create(user.userId, dto);
    }

    @Get()
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(PaginatedRetakeDto)
    getManyRetake(
        @CurrentUser() user: any,
        @Query() query: QueryRetakeDto,
    ) {
        return this.retakeService.getManyRetakes(user.userId, user.role, query);
    }

    @Get(':id')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(RetakeResponseDto)
    getRetakeById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.retakeService.getRetakeById(user.userId, user.role, id);
    }

    @Patch(':id/reject')
    @Roles(Role.TEACHER)
    @Serialize(RetakeResponseDto)
    reject(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.retakeService.rejectRetake(user.userId, id);
    }

    @Post(':id/grant')
    @Roles(Role.TEACHER)
    @Serialize(PermissionResponseDto)
    grantPermission(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreatePermissionDto,
    ) {
        return this.retakeService.grantPermission(user.userId, id, dto);
    }

    @Get('/permissions')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(PaginatedPermissionDto)
    getManyPermission(
        @CurrentUser() user: any,
        @Query() query: QueryPermissionDto,
    ) {
        return this.retakeService.getManyPermission(user.userId, user.role, query);
    }

    @Get('/permissions/:id')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(PermissionResponseDto)
    getPermissionById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.retakeService.getPermissionById(user.userId, user.role, id);
    }




}




