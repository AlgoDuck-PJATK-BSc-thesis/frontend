
export interface DuckDto{
    id: string,
}


export interface Item {
    itemId: string,
    name: string,
    price: number,
    isOwned: boolean,
    description: string,
    itemRarity: RarityDto
}


export interface PlantItem {
    itemId: string,
    name: string,
    price: number,
    isOwned: boolean,
    description: string,
    itemRarity: RarityDto,
    width: number,
    height: number
}

export interface RarityDto {
    rarityName: string
}


export interface DuckShopPage{
    ducksPaged: Array<Item>,
    hasNext: boolean,
    hasPrev: boolean,
    totalPages: number,
}
