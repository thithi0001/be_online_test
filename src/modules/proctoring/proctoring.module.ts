import { Module } from "@nestjs/common";
import { ProctoringController } from "./proctoring.controller";
import { ProctoringService } from "./proctoring.service";

@Module({
    imports: [],
    controllers: [ProctoringController],
    providers: [ProctoringService],
    exports: [ProctoringService],
})
export class ProctoringModule {}