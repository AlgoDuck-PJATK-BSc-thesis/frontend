export type ItemDto = {
    ItemId: string | null,
    ItemName: string | null,
    CreatedOn: Date | null,
    CreatedBy: string | null,
    OwnedCount: number | null,
    Type: string | null
}
export type ItemKeys = keyof ItemDto


export const QueryableColumns =  ["ItemId", "ItemName", "CreatedOn", "CreatedBy", "OwnedCount", "Type"] as const;
export type QueryableColumn = (typeof QueryableColumns)[number] & keyof ItemDto;
