
export interface DuckDto{
    id: string,
}


export interface Duck {
    itemId: string,
    name: string,
    price: number,
    isOwned: boolean,
    description: string,
    itemRarity: RarityDto
    
}

export interface RarityDto {
    rarityName: string
}


export interface DuckShopPage{
    ducksPaged: Array<Duck>,
    hasNext: boolean,
    hasPrev: boolean,
    totalPages: number,
}
