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

export interface duckPositionalData {
    x: number;
    y: number;
    startX: number;
    startY: number;
    targetX: number;
    targetY: number;
    directionIndex: number;
    moveProgress: number;
    isMoving: boolean;
    isSwimming: boolean;
    framesUntilNewDirection: number;
}


export interface rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}

export type Coords = {
    x: number,
    y: number
}


export type ItemType = "Duck" | "Plant"