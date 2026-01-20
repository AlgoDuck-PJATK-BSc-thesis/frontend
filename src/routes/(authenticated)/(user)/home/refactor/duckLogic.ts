import { DIRECTION_VECTORS, DUCK_DIMENSIONS, DUCK_HEIGHT, DUCK_WIDTH, FORWARD_BIAS_STRENGTH, MIN_DUCK_DISTANCE, MOVE_DURATION, MOVEMENT_SAFETY_BUFFER, NUM_DIRECTIONS, STEP_DISTANCE } from './constants';
import { isPixelBlack, samplePixel } from './gridUtils';
import type { BoundingBox2d, BoundingBox2dCollisionData, Coords, DuckAnimationContext, DuckPositionalData, ObjectDims2d, Vec2 } from './PondTypes';

export const easeOutQuad = (t: number): number => {
	return 1 - (1 - t) * (1 - t);
};

export const isPositionValid = (position: Coords, ctx: DuckAnimationContext): boolean => {
	const boundingBox: BoundingBox2d = getBoundingBoxForCoordinates(position, DUCK_DIMENSIONS);

	for (const point of Object.values(boundingBox)) {
		if (point.x < 0 || point.y < 0 || point.x >= ctx.canvasDims.width || point.y >= ctx.canvasDims.height) {
			return false;
		}

		const pixel: Uint8ClampedArray | null = samplePixel(ctx.pixelData, ctx.canvasDims, point);
		if (!pixel) return false;

		if (isPixelBlack(pixel)) {
			return false;
		}
	}

	return true;
};

const getDuckCurrentPositionWithMovement = (duck: DuckPositionalData): Coords => {
	if (duck.isMoving) {
		const easedProgress = easeOutQuad(Math.min(duck.moveProgress, 1));
		return {
			x: duck.startCoords.x + (duck.targetCoords.x - duck.startCoords.x) * easedProgress,
			y: duck.startCoords.y + (duck.targetCoords.y - duck.startCoords.y) * easedProgress
		}
	}
	return duck.currentCoords;
}

export const wouldCollideWithDucks = (
	position: Coords,
	excludeDuckId: string,
	duckPositions: Record<string, DuckPositionalData>
): boolean => {
	const mainBoundingBox: BoundingBox2d = getBoundingBoxForCoordinates(position, DUCK_DIMENSIONS);
	for (const [k, otherDuck] of Object.entries(duckPositions)){
		if (k === excludeDuckId) continue;

		const otherDuckCoords: Coords = getDuckCurrentPositionWithMovement(otherDuck);
		const otherBoundingBox: BoundingBox2d = getBoundingBoxForCoordinates(otherDuckCoords, DUCK_DIMENSIONS);
		const collisionData: BoundingBox2dCollisionData = checkBoundingBoxCollisions(mainBoundingBox, otherBoundingBox);

		if (Object.values(collisionData).some(v => v)) {
			return true;
		}
	}
	return false;
};

export const isPositionValidForDuck = (position: Coords, duckId: string, ctx: DuckAnimationContext): boolean => {
	if (!isPositionValid(position, ctx)) return false;
	if (wouldCollideWithDucks(position, duckId, ctx.duckPositionsKeyed)) return false;
	return true;
};

const getBoundingBoxForCoordinates = (position: Coords, dimensions: ObjectDims2d): BoundingBox2d => {
	return {
		topLeft: { x: position.x, y: position.y },
		topRight: { x: position.x + dimensions.width, y: position.y },
		bottomLeft: { x: position.x, y: position.y + dimensions.height },
		bottomRight: { x: position.x + dimensions.width, y: position.y + dimensions.height },  
		center: { x: position.x + dimensions.width / 2, y: position.y + dimensions.height / 2 }
	}
}

/* 
	return collisions from the perspective of argument 1, ergo box1 so in the scenario
			___________
	________|__	box2   |
	|  box1 |_|________|
	__________

	the output will be
	{
		top: true,
		right: false,
		left: false,
		bottom: false	
	}
*/
const checkBoundingBoxCollisions = (box1: BoundingBox2d, box2: BoundingBox2d): BoundingBox2dCollisionData => {
    const overlapsX = box1.topLeft.x < box2.topRight.x && box1.topRight.x > box2.topLeft.x;
    const overlapsY = box1.topLeft.y < box2.bottomLeft.y && box1.bottomLeft.y > box2.topLeft.y; 
    
    if (!overlapsX || !overlapsY) {
        return { top: false, bottom: false, left: false, right: false };
    }
    
    const overlapLeft = box1.topRight.x - box2.topLeft.x;
    const overlapRight = box2.topRight.x - box1.topLeft.x;
    const overlapTop = box1.topLeft.y - box2.bottomLeft.y;
    const overlapBottom = box2.topLeft.y - box1.bottomLeft.y;
    
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    
    return {
        top: minOverlap === overlapTop,
        bottom: minOverlap === overlapBottom,
        left: minOverlap === overlapLeft,
        right: minOverlap === overlapRight
    };
}

export const getMaxSafeDistanceForDuck = (
	startCoords: Coords,
	dirIndex: number,
	duckId: string,
	ctx: DuckAnimationContext,
	maxDist: number = STEP_DISTANCE * 3
): number => {
	const dir = DIRECTION_VECTORS[dirIndex];
	const endCoords: Coords = {
		x: startCoords.x + dir.x * maxDist,
		y: startCoords.y + dir.y * maxDist
	}

	if (isPositionValidForDuck(endCoords, duckId, ctx)) {
		return maxDist;
	}

	let minSafe = 0;
	let maxUnsafe = maxDist;
	const precision = 2;

	while (maxUnsafe - minSafe > precision) {
		const mid = (minSafe + maxUnsafe) / 2;
		const testCoords: Coords = {
			x: startCoords.x + dir.x * mid,
			y: startCoords.y + dir.y * mid
		}

		if (isPositionValidForDuck(testCoords, duckId, ctx)) {
			minSafe = mid;
		} else {
			maxUnsafe = mid;
		}
	}

	return minSafe;
};

export const clipMovementForDuck = (
	startCoords: Coords,
	dirIndex: number,
	targetDistance: number,
	duckId: string,
	ctx: DuckAnimationContext
): number => {
	const dir = DIRECTION_VECTORS[dirIndex];
	const endX = startCoords.x + dir.x * targetDistance;
	const endY = startCoords.y + dir.y * targetDistance;

	if (isPositionValidForDuck({x: endX, y: endY}, duckId, ctx)) {
		return targetDistance;
	}

	const safeDistance = getMaxSafeDistanceForDuck(startCoords, dirIndex, duckId, ctx, targetDistance);
	const buffer: number = 5;
	return Math.max(0, safeDistance - buffer);
};

const normalize = (arr: number[]): number[] => {
	const sum = arr.reduce((a, b) => a + b, 0);
	if (sum === 0) return arr.map(() => 1 / arr.length);
	return arr.map((el) => el / sum);
};

const weightedRandomSelect = (probabilities: number[]): number => {
	const random: number = Math.random();
	let sum = 0;

	for (let i = 0; i < probabilities.length; i++) {
		sum += probabilities[i];
		if (random <= sum) {
			return i;
		}
	}

	return probabilities.length - 1;
};

export const pickNewDirection = (duckId: string, ctx: DuckAnimationContext): void => {
	const duck: DuckPositionalData | undefined = ctx.duckPositionsKeyed[duckId];
	if (!duck) return;
	const currentDir = duck.directionIndex;

	const weights: number[] = [];
	const safeDistances: number[] = [];

	for (let i = 0; i < NUM_DIRECTIONS; i++) {
		const safeDistance: number = clipMovementForDuck(duck.currentCoords, i, STEP_DISTANCE, duckId, ctx);
		safeDistances.push(safeDistance);

		const dirDiffFromCurr: number = Math.min(Math.abs(i - currentDir), NUM_DIRECTIONS - Math.abs(i - currentDir));
		const forwardBias: number = 1 + FORWARD_BIAS_STRENGTH * (NUM_DIRECTIONS / 2 - dirDiffFromCurr);

		const weight: number = safeDistance > MOVEMENT_SAFETY_BUFFER ? safeDistance * forwardBias : 0;
		weights.push(weight);
	}

	const totalWeight = weights.reduce((a, b) => a + b, 0);
	if (totalWeight === 0) {
		duck.framesUntilNewDirection = 10;
		return;
	}

	const probabilities: number[] = normalize(weights);
	const selectedDirection: number = weightedRandomSelect(probabilities);
	const safeDistance: number = safeDistances[selectedDirection];

	if (safeDistance > MOVEMENT_SAFETY_BUFFER) {
		const dir: Vec2 = DIRECTION_VECTORS[selectedDirection];
		duck.directionIndex = selectedDirection;
		duck.startCoords.x = duck.currentCoords.x;
		duck.startCoords.y = duck.currentCoords.y;
		duck.targetCoords.x = duck.currentCoords.x + dir.x * safeDistance;
		duck.targetCoords.y = duck.currentCoords.y + dir.y * safeDistance;
		duck.moveProgress = 0;
		duck.isMoving = true;
	}

	duck.framesUntilNewDirection = Math.floor(Math.random() * 60) + 30;
};

export const calculateSpawnPosition = (duckId: string, containerCenter: Coords, ctx: DuckAnimationContext): Coords | null => {
	let spawnCoords: Coords;
	let attempts = 0;
	const maxAttempts = 50;

	const duckNumber: number = (Object.keys(ctx.duckPositionsKeyed).length + 1);
	do {
		const angle = Math.PI * 2 + (Math.random() - 0.5) * 0.5;
		const radius = MIN_DUCK_DISTANCE * 0.6 * (1 + duckNumber * 0.5) + Math.random() * 20;

		spawnCoords = {
			x: containerCenter.x + Math.cos(angle) * radius,
			y: containerCenter.y + Math.sin(angle) * radius
		}
		attempts++;

		if (attempts >= maxAttempts) {
			return spawnCoords;
		}
	} while (
		!isPositionValid(spawnCoords, ctx) ||
		wouldCollideWithDucks(spawnCoords, duckId, ctx.duckPositionsKeyed)
	);

	return spawnCoords;
};

export const createDuckPositionalData = (x: number, y: number): DuckPositionalData => {
	const startingDirection = Math.floor(Math.random() * NUM_DIRECTIONS);	
	return {
		currentCoords: {
			x: x,
			y: y
		},
		startCoords: {
			x: x,
			y: y
		},
		targetCoords: {
			x: x,
			y: y
		},
		directionIndex: startingDirection,
		moveProgress: 1,
		isMoving: false,
		isSwimming: false,
		framesUntilNewDirection: Math.floor(Math.random() * 30)
	};
};

export const updateDuckAnimation = (
	duck: DuckPositionalData,
	duckId: string,
	ctx: DuckAnimationContext
): { gifChanged: boolean; newGifPath: string | null; visualCoords: Coords; flipX: boolean } => {
	let gifChanged = false;
	let newGifPath: string | null = null;
	let visualCoords: Coords = {
		x: duck.currentCoords.x,
		y: duck.currentCoords.y
	}
	if (duck.isMoving) {
		if (!duck.isSwimming) {
			duck.isSwimming = true;
			gifChanged = true;
			newGifPath = `${`https://d3018wbyyxg1xc.cloudfront.net/duck/${duckId}/Swimming.gif`}`;
		}

		duck.moveProgress += 1 / MOVE_DURATION;

		if (duck.moveProgress >= 1) {
			duck.moveProgress = 1;
			duck.isMoving = false;
			duck.currentCoords.x = duck.targetCoords.x;
			duck.currentCoords.y = duck.targetCoords.y;

			duck.isSwimming = false;
			gifChanged = true;
			newGifPath = `https://d3018wbyyxg1xc.cloudfront.net/duck/${duckId}/Idle.gif`;
		}


		visualCoords = getDuckCurrentPositionWithMovement(duck);
	} else {
		duck.framesUntilNewDirection--;

		if (duck.framesUntilNewDirection <= 0) {
			pickNewDirection(duckId, ctx);
		}
	}

	const flipX = duck.directionIndex <= Math.floor(DIRECTION_VECTORS.length / 2);

	return { gifChanged, newGifPath, visualCoords, flipX };
};

export const scaleDuckPositions = (
	duckPositions: Record<string, DuckPositionalData>,
	scaleX: number,
	scaleY: number,
	newObjectDims: ObjectDims2d,
	ctx: DuckAnimationContext
): void => {
	for (const [itemId, duck] of Object.entries(duckPositions)){
		duck.currentCoords.x *= scaleX;
		duck.currentCoords.y *= scaleY;
		duck.startCoords.x *= scaleX;
		duck.startCoords.y *= scaleY;
		duck.targetCoords.x *= scaleX;
		duck.targetCoords.y *= scaleY;

		if (!isPositionValid({x: duck.currentCoords.x, y: duck.currentCoords.y}, ctx)) {
			const centerX = newObjectDims.width / 2 - DUCK_WIDTH / 2;
			const centerY = newObjectDims.height / 2 - DUCK_HEIGHT / 2;

			for (let t = 0; t <= 1; t += 0.1) {
				const testX = duck.currentCoords.x + (centerX - duck.currentCoords.x) * t;
				const testY = duck.currentCoords.y + (centerY - duck.currentCoords.y) * t;
				if (isPositionValid({x: testX, y: testY}, ctx)) {
					duck.currentCoords.x = testX;
					duck.currentCoords.y = testY;
					duck.startCoords.x = testX;
					duck.startCoords.y = testY;
					duck.targetCoords.x = testX;
					duck.targetCoords.y = testY;
					duck.isMoving = false;

					break;
				}
			}
		}
	}
};