export interface CustomPageData<T>
{
    currPage: number,
    pageSize: number,
    totalItems: number,
    nextCursor?: number,
    prevCursor?: number,
    items: T[]
}
