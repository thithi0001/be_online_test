import { Module } from "@nestjs/common";
import { ClassController } from "./class.controller";
import { ClassService } from "./class.service";
import { NotificationModule } from "../notification/notification.module";
import { UserModule } from "../user/users.module";

@Module({
    imports: [
        NotificationModule,
        UserModule,
    ],
    controllers: [ClassController],
    providers: [ClassService],
    exports: [ClassService],
})
export class ClassModule {}