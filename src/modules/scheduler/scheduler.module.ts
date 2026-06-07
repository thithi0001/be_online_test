import { Module } from "@nestjs/common";
import { AttemptModule } from "../attempt/attempt.module";
import { SchedulerService } from "./scheduler.service";

@Module({
    imports: [AttemptModule],
    providers: [SchedulerService],
})
export class SchedulerModule {}