import type { ItemType } from "$lib/Components/Misc/Pond/duckTypes"
import type { Component } from "svelte"

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
    $type: string
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

export interface Item {
    itemId: string;
    name: string;
    description: string;
    price: number;
    rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export type ShopPageArgs = {
    itemType: ItemType;
    endpoint: string;
    itemDisplay: Component<{ options: Item; onclick: () => void }>;
    select: (selected: Item, wasAutomatic: boolean) => void;
};

export interface ShopChatMessageArg {
    messageContents: string;
    dismissCallback: () => void;
    wasTypedFully: boolean,
}

export interface ShopkeepPrompt extends ShopChatMessageArg {
}

export interface BinaryUserInteractionArgs extends ShopChatMessageArg {
    onAccept: () => void;
    onReject: () => void;
    acceptLabel?: string;
    rejectLabel?: string;
}