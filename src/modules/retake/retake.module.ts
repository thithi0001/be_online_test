import { Module } from "@nestjs/common";
import { SessionModule } from "../exam/examSession/examSession.module";
import { AttemptModule } from "../attempt/attempt.module";
import { RetakeController } from "./retake.controller";
import { RetakeService } from "./retake.service";

@Module({
    imports: [
        SessionModule,
        AttemptModule,
    ],
    controllers: [RetakeController],
    providers: [RetakeService],
    exports: [RetakeService],
})
export class RetakeModule {}