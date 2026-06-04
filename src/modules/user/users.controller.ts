import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UserService } from "./users.service";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { PaginatedUserDto, QueryUserDto, UserResponseDto } from "./dto/user-response.dto";
import { CreateUserDto, UpdateUserDto } from "./dto/create-user.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
    constructor(private readonly userService: UserService) {
        
    }

    @Post()
    @Roles(Role.ADMIN)
    @Serialize(UserResponseDto)
    create(
        @Body() dto: CreateUserDto
    ) {
        return this.userService.create(dto);
    }
    
    @Get(':id')
    @Roles(Role.ADMIN, Role.TEACHER)
    @Serialize(UserResponseDto)
    getById(
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.userService.getById(id);
    }

    @Get()
    @Serialize(PaginatedUserDto)
    getAll(
        @Body() userIds: number[],
        @Query() query: QueryUserDto
    ) {
        return this.userService.getMany(userIds, query);
    }
            
    @Get('me')
    @Serialize(UserResponseDto)
    getMyProfile(
        @CurrentUser() user: any
    ) {
        return this.userService.getById(user.userId);
    }

    @Patch('me')
    @Serialize(UserResponseDto)
    update(
        @CurrentUser() user: any,
        @Body() dto: UpdateUserDto
    ) {
        return this.userService.update(user.userId, dto);
    }

    @Patch('password')
    changePassword(
        @CurrentUser() user: any,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.userService.changePassword(
            user.userId,
            dto
        );
    }


}