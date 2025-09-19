import type { DuckDto } from "./DuckDto";

export interface ShopPageDto{
    ducksFetched: Array<DuckDto>,
    page: number,
    totalPages: number,
    hasNext: boolean,
    hasPrevious: boolean,
}