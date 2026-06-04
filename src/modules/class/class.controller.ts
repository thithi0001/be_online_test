import { Body, Controller, Post, UseFilters, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ClassService } from "./class.service";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { ClassDto, CreateClassDto } from "./dto/class.dto";
import { PrismaExceptionFilter } from "@/common/filters/prisma-exception.filter";

@Controller('classes')
@UseFilters(PrismaExceptionFilter)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
    constructor(private readonly classService: ClassService) {
        
    }

    @Post()
    @Roles(Role.TEACHER)
    create(
        @Body() dto: CreateClassDto
    ) {
        return this.classService.create(dto);
    }

    
}