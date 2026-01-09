export type ItemDto = {
    itemId: string,
    itemName: string | null,
    createdOn: Date | null,
    createdBy: string | null,
    ownedCount: number | null,
    type: string | null
}


export const QueryableColumns =  ["itemId", "itemName", "createdOn", "createdBy", "ownedCount", "type"] as const;
export type QueryableColumn = (typeof QueryableColumns)[number] & keyof ItemDto;
