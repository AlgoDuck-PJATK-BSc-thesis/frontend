export type RarityDto = {
    rarityId: string,
    name: string
}

export const ItemTypes = ["duck", "plant"] as const;
export type ItemType = (typeof ItemTypes)[number];


export type ItemCreateDto = {
    itemName: string,
    description: string,
    itemCost: number,
    rarityId: string,
    itemData: IItemTypeSpecificData,
}

export interface IItemTypeSpecificData {
    "$type": ItemType,
}

export interface DuckData extends IItemTypeSpecificData {}
export interface PlantData extends IItemTypeSpecificData {
    width: number,
    height: number
}

export type FilePostingResult = {
    fileName: string;
    result: "Success" | "Error";
    reason?: string;
};

export type ItemCreateResponseDto = {
    createdItemGuid: string;
    files: FilePostingResult[];
};

export type SpriteSlot = {
    key: string;
    label: string;
    description: string;
    accept: string;
    file?: File;
}