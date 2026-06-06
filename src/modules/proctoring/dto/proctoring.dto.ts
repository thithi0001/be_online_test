import { EventType } from "@/common/enums/event-type.enum";
import { IsEnum, IsInt, IsNotEmpty, IsObject } from "class-validator";

export class CreateEventDto {
    @IsInt()
    attemptId: number;
    
    @IsEnum(EventType)
    eventType: EventType;
    
    @IsObject()
    @IsNotEmpty()
    metadata: Record<string, any>;
}

