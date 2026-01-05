export type UsedDuckDto = {
    itemId: string,
    isSelectedAsAvatar: boolean,
    isSelectedForPond: boolean
}

export type UsedPlantDto = {
    itemId: string,
    width: number,
    height: number,
    gridX: number,
    gridY: number,
}

export type OwnedDuck = {
    itemId: string,
    isSelectedAsAvatar: boolean,
    isSelectedForPond: boolean
}

export type OwnedPlantDto = {
    itemId: string,
    width: number,
    height: number,
}

export type Coords = {
    x: number,
    y: number
}

export type ItemType = "Duck" | "Plant"