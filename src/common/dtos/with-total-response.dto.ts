import { Expose } from "class-transformer";

export class WithTotalResponseDto<T> {
    @Expose()
    data: T[];

    @Expose()
    total: number;
}