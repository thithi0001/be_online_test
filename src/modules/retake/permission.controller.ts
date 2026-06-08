import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RetakeService } from "./retake.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { PaginatedPermissionDto, PermissionResponseDto, QueryPermissionDto } from "./dto/retake-response.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CreatePermissionDto } from "./dto/retake.dto";

@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
    constructor(private readonly retakeService: RetakeService) {}

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

    @Get()
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(PaginatedPermissionDto)
    getManyPermission(
        @CurrentUser() user: any,
        @Query() query: QueryPermissionDto,
    ) {
        return this.retakeService.getManyPermission(user.userId, user.role, query);
    }

    @Get(':id')
    @Roles(Role.TEACHER, Role.STUDENT)
    @Serialize(PermissionResponseDto)
    getPermissionById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.retakeService.getPermissionById(user.userId, user.role, id);
    }
}