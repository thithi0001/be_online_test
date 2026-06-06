import { Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { NotificationService } from "./notification.service";
import { Serialize } from "@/common/decorators/serialize.decorator";
import { NotificationResponseDto, PaginatedNotificationDto, QueryNotificationDto } from "./dto/notification-response.dto";
import { CurrentUser } from "@/common/decorators/current-user.decorator";

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
    constructor(private readonly notiService: NotificationService) {}

    @Get()
    @Serialize(PaginatedNotificationDto)
    getMany(
        @CurrentUser() user: any,
        @Query() query: QueryNotificationDto,
    ) {
        return this.notiService.getMany(user.userId, query);
    }

    @Get(':id')
    @Serialize(NotificationResponseDto)
    getById(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.notiService.getById(user.userId, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: any,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.notiService.update(user.userId, id);
    }
    


}




