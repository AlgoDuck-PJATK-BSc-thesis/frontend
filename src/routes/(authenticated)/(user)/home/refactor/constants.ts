import type { ObjectDims2d, Rgba, Vec2 } from './PondTypes';

export const DUCK_HEIGHT = 65;
export const DUCK_WIDTH = DUCK_HEIGHT * 1.07;
export const DUCK_COLLISION_RADIUS = 60;
export const MIN_DUCK_DISTANCE = DUCK_COLLISION_RADIUS * 2;

export const STEP_DISTANCE = 120;
export const MOVE_DURATION = 182;
export const FORWARD_BIAS_STRENGTH = 0.3;

export const GRID_COLUMNS = 24;
export const GRID_ROWS = 11;
export const GRID_ELEMENTS = GRID_COLUMNS * GRID_ROWS;

export const gridColumns = GRID_COLUMNS;
export const gridRows = GRID_ROWS;
export const gridElements = gridColumns * gridRows;

/* 
    the number of pixels which decides whether a duck should preemptively discard a given direction before selecting for movement start. 
*/
export const MOVEMENT_SAFETY_BUFFER: number = 10;

export const LandColor: Rgba = {
	r: 0,
	g: 0,
	b: 0,
	a: 255
};

export const DUCK_DIMENSIONS: ObjectDims2d = {
	width: DUCK_WIDTH,
	height: DUCK_HEIGHT
};

export const DIRECTION_VECTORS: Array<Vec2> = [
	{ x: 0, y: -1 },
	{ x: 0.5, y: -0.5 },
	{ x: 1, y: 0 },
	{ x: 0.5, y: 0.5 },
	{ x: 0, y: 1 },
	{ x: -0.5, y: 0.5 },
	{ x: -1, y: 0 },
	{ x: -0.5, y: -0.5 }
] as const;

export const NUM_DIRECTIONS = DIRECTION_VECTORS.length;
