import { Module } from "@nestjs/common";
import { SessionModule } from "../exam/examSession/examSession.module";
import { ClassModule } from "../class/class.module";
import { AttemptController } from "./attempt.controller";
import { AttemptService } from "./attempt.service";

@Module({
    imports: [
        SessionModule,
        ClassModule,
    ],
    controllers: [AttemptController],
    providers: [AttemptService],
    exports: [AttemptService],
})
export class AttemptModule {}