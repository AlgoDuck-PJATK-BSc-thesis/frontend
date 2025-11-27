export interface DuckShopPage{
    ducksPaged: Array<DuckDto>,
    hasNext: boolean,
    hasPrev: boolean,
    totalPages: number,
}

export interface DuckDto{
    id: string,
}