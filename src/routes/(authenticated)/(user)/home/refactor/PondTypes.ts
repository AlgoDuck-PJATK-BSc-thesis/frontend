export type Coords = {
    x: number;
    y: number;
}

export type ObjectDims2d = {
    width: number,
    height: number
}

export type Vec2 = {
    x: number,
    y: number
}

export type BoundingBox2d = {
    topLeft: Coords,
    topRight: Coords,
    bottomLeft: Coords,
    bottomRight: Coords,
    center: Coords,
}

export type BoundingBox2dCollisionData = {
    top: boolean,
    left: boolean,
    right: boolean,
    bottom: boolean,
}

export type GridDimensions = {
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
}

export type CanvasContext = {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pixelData: ImageData | null;
}

export type GridPoint = {
    col: number;
    row: number;
}

export type Rgba = {
    r: number;
    g: number;
    b: number;
    a: number;
}

export type HighlightAction = {
    point: GridPoint;
    color: Rgba;
}

export type DuckPositionalData = {
    currentCoords: Coords;
    startCoords: Coords;
    targetCoords: Coords;
    directionIndex: number;
    moveProgress: number;
    isMoving: boolean;
    isSwimming: boolean;
    framesUntilNewDirection: number;
}

export type DuckAnimationContext = {
    pixelData: ImageData;
    canvasDims: ObjectDims2d,
    duckPositionsKeyed: Record<string, DuckPositionalData>,
}