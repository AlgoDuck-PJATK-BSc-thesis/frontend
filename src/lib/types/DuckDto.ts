export interface DuckDto{
    id: string,
    name: string,
    description: string,
    isPurchased: boolean,
    price: number,
    rarity: DuckRarity,

}

export enum DuckRarity{
    Common, Uncommon, Rare, Epic, Legendary
}