import { Expose } from "class-transformer";

export class PaginationResponseDto<T> {
    @Expose()
    data: T[];

    @Expose()
    pagination: {
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export class PaginationMetaDto {
    @Expose()
    total: number;

    @Expose()
    page: number;

    @Expose()
    limit: number;

    @Expose()
    totalPages: number;
}