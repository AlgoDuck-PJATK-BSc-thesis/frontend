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
    framesUntilNewDirection: number;
    underlyingImage: HTMLImageElement;
}

export interface rgba {
    r: number;
    g: number;
    b: number;
    a: number;
}
