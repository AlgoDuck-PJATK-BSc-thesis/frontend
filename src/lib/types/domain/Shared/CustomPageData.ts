export interface CustomPageData<T>
{
    currPage: number,
    pageSize: number,
    totalItems: number,
    items: T[]
}
