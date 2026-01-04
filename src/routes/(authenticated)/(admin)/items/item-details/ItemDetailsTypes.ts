export interface IItemTypeSpecificData {
    $type: ItemType;
}

export type ItemType = "duck" | "plant";

export interface DuckData extends IItemTypeSpecificData {
    $type: "duck";
}

export interface PlantData extends IItemTypeSpecificData {
    $type: "plant";
    width: number;
    height: number;
}

export type FullItemDetailsDto = {
    itemId: string;
    itemName: string;
    itemDescription?: string;
    createdOn: string;
    createdBy: string;
    purchases: number;
    price: number;
    itemType: ItemType;
    itemTypeSpecificData: IItemTypeSpecificData;
};

export type SpriteInfo = {
    key: string;
    label: string;
    url: string;
};

export const getSpriteConfigForType = (itemType: ItemType): { key: string; label: string }[] => {
    switch (itemType) {
        case "duck":
            return [
                { 
                    key: "sprite",
                    label: "Sprite" 
                },
                { 
                    key: "idle", 
                    label: "Idle" 
                },
                { 
                    key: "swimming", 
                    label: "Swimming" 
                }
            ];
        case "plant":
            return [
                { 
                    key: "day", 
                    label: "Day" 
                },
                { 
                    key: "night", 
                    label: "Night" 
                }
            ];
        default:
            return [];
    }
};