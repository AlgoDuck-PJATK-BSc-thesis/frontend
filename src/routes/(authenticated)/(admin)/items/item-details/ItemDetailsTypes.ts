export interface IItemTypeSpecificData {
    $type: ItemType;
}

export type ItemType = "Duck" | "Plant";

export interface DuckData extends IItemTypeSpecificData {
    $type: "Duck";
}

export interface PlantData extends IItemTypeSpecificData {
    $type: "Plant";
    width: number;
    height: number;
}

export interface ItemSpecificStatistics{
    $type: ItemType,
    ownedCount: number,
    ownedByPercentageOfPopulation: number,
    usedByCount: number,
    usedByPercentageOfPopulation: number,
}
export interface DuckOwnershipStatistics extends ItemSpecificStatistics {
    usedAsAvatar: number,
    usedAsAvatarPercentageOfPopulation: number,
    usedForPond: number
    usedForPondPercentageOfPopulation: number
}
export interface PlantOwnershipStatistics extends ItemSpecificStatistics {
    usedForPond: number
    usedForPondPercentageOfPopulation: number
}

export type ItemDetailsCore = {
    itemId: string;
    itemName: string;
    itemDescription?: string;
    createdOn: string;
    createdBy: string;
    purchases: number;
    price: number;
    itemType: ItemType;
}

export type TimeSeriesGranularity = "month" | "day"

export type ItemPurchaseTimeseriesData = {
    granularity: TimeSeriesGranularity,
    startDate: Date,
    buckets: TimeseriesBucket[]
}

export type TimeseriesBucket = {
    label: string,
    value: number
}

export type FullItemDetailsDto = {
    itemDetailsCore: ItemDetailsCore,
    spriteList: string[];
    itemTypeSpecificData: IItemTypeSpecificData;
    itemSpecificStatistics: ItemSpecificStatistics,
    timeseriesData: ItemPurchaseTimeseriesData
};

export type SpriteInfo = {
    key: string;
    label: string;
    url: string;
};