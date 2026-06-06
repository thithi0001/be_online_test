import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ProctoringService } from "./proctoring.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CreateEventDto } from "./dto/proctoring.dto";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { PaginatedEventDto, ProctoringEventResponseDto, QueryEventDto } from "./dto/proctoring-response.dto";

@Controller('proctorings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProctoringController {
    constructor(private readonly proctoringService: ProctoringService) {}

    @Post()
    @Roles(Role.STUDENT)
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateEventDto,
    ) {
        return this.proctoringService.create(dto);
    }

    @Get()
    @Roles(Role.TEACHER)
    @Serialize(PaginatedEventDto)
    getMany(
        @CurrentUser() user: any,
        @Query() query: QueryEventDto,
    ) {
        return this.proctoringService.getMany(user.userId, query);
    }

    @Get(':id')
    @Roles(Role.TEACHER)
    @Serialize(ProctoringEventResponseDto)
    getById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.proctoringService.getById(user.userId, id);
    }

    
}



