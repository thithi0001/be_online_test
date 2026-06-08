import { Module } from "@nestjs/common";
import { SessionModule } from "../exam/examSession/examSession.module";
import { AttemptModule } from "../attempt/attempt.module";
import { RetakeController } from "./retake.controller";
import { PermissionController } from "./permission.controller";
import { RetakeService } from "./retake.service";
import { NotificationModule } from "../notification/notification.module";

@Module({
    imports: [
        SessionModule,
        AttemptModule,
        NotificationModule,
    ],
    controllers: [RetakeController, PermissionController],
    providers: [RetakeService],
    exports: [RetakeService],
})
export class RetakeModule {}