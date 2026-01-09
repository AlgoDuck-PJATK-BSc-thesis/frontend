import type { rgba } from "$lib/Components/AnimatedPondTypes";
import { GRID_COLUMNS, GRID_ELEMENTS, GRID_ROWS, LandColor } from "./constants";
import type { Coords, GridDimensions, GridPoint, HighlightAction, ObjectDims2d } from "./PondTypes";


export const loadImageToCanvas = (canvas: HTMLCanvasElement, imagePath: string, extractPixelData: boolean = false): Promise<ImageData | null> => {
	return new Promise((resolve) => {
		const ctx = canvas.getContext('2d', { willReadFrequently: extractPixelData });
		if (!ctx) {
			resolve(null);
			return;
		}

		const img = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			if (extractPixelData) {
				resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
			} else {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = imagePath;
	});
};

export const samplePixel = (pixelData: ImageData, canvasDims: ObjectDims2d, coordinates: Coords): Uint8ClampedArray | null => {
	const roundedCol = Math.floor(coordinates.x);
	const roundedRow = Math.floor(coordinates.y);

	if (roundedCol <= 0 || roundedRow <= 0 || roundedCol >= canvasDims.width - 1 || roundedRow >= canvasDims.height - 1) {
		return null;
	}

	const pixelIndex = (roundedRow * canvasDims.width + roundedCol) * 4;
	return pixelData.data.slice(pixelIndex, pixelIndex + 4);
};

export const isPixelBlack = (pixel: Uint8ClampedArray): boolean => {
	return pixel[0] === LandColor.r && pixel[1] === LandColor.g && pixel[2] === LandColor.b && pixel[3] === LandColor.a;
};

export const getRelativeCoordinates = (e: MouseEvent, element: HTMLElement): Coords => {
	const rect = element.getBoundingClientRect();
	return {
		x: e.clientX - rect.left,
		y: e.clientY - rect.top
	};
};

export const pixelToGridCoords = (pixelCoords: Coords, cellDims: ObjectDims2d): Coords => {
	return {
		x: Math.max(0, Math.min(GRID_COLUMNS - 1, Math.floor(pixelCoords.x / cellDims.width))),
		y: Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(pixelCoords.y / cellDims.height)))
	};
};

export const gridToPixelCoords = (gridPoint: GridPoint, cellDims: ObjectDims2d): Coords => {
	return {
		x: gridPoint.col * cellDims.width,
		y: gridPoint.row * cellDims.height
	};
};

export const getGridDimensions = (containerDims: ObjectDims2d): GridDimensions => {
	return {
		width: containerDims.width,
		height: containerDims.height,
		cellWidth: containerDims.width / GRID_COLUMNS,
		cellHeight: containerDims.height / GRID_ROWS
	};
};

export const drawGrid = (canvas: HTMLCanvasElement, strokeStyle: string = 'rgba(55, 65, 81, 0.5)', lineWidth: number = 1): void => {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const { width, height } = canvas;
	const cellWidth = width / GRID_COLUMNS;
	const cellHeight = height / GRID_ROWS;

	ctx.clearRect(0, 0, width, height);
	ctx.strokeStyle = strokeStyle;
	ctx.lineWidth = lineWidth;

	for (let i = 0; i <= GRID_COLUMNS; i++) {
		const x = Math.floor(i * cellWidth) + 0.5;
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, height);
		ctx.stroke();
	}

	for (let i = 0; i <= GRID_ROWS; i++) {
		const y = Math.floor(i * cellHeight) + 0.5;
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
};


export const rgbaObjToRgbaStr = (obj: rgba) => {
	return `rgba(${obj.r}, ${obj.g}, ${obj.b}, ${obj.a})`;
}

export const HightlightCells2 = (canvas: HTMLCanvasElement, ...actions: HighlightAction[]) => {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const cellDims: ObjectDims2d = {
		width: canvas.width / GRID_COLUMNS,
		height: canvas.height / GRID_ROWS
	}
	actions.forEach((a) => {
		const pixelCoords: Coords = gridToPixelCoords(a.point, cellDims);
		ctx.fillStyle = rgbaObjToRgbaStr(a.color);
		ctx.fillRect(pixelCoords.x, pixelCoords.y, cellDims.width, cellDims.height);
	})
}

export const highlightCells = (
	canvas: HTMLCanvasElement,
	cells: Coords[],
	isOccupied: (coord: Coords) => boolean,
	validColor: string = 'rgba(68, 239, 68, 0.5)',
	invalidColor: string = 'rgba(239, 68, 68, 0.5)'
): void => {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const cellWidth = canvas.width / GRID_COLUMNS;
	const cellHeight = canvas.height / GRID_ROWS;

	cells.forEach((c) => {
		ctx.fillStyle = isOccupied(c) ? invalidColor : validColor;
		ctx.fillRect(c.x * cellWidth, c.y * cellHeight, cellWidth, cellHeight);
	});
};

export const initializeGridOccupancy = (workCtx: CanvasRenderingContext2D, canvasDims: ObjectDims2d, landThreshold: number = 0.8): boolean[] => {
	const occupancy: boolean[] = Array(GRID_ELEMENTS).fill(false);
	const cellWidth: number = canvasDims.width / GRID_COLUMNS;
	const cellHeight: number = canvasDims.height / GRID_ROWS;

	for (let row = 0; row < GRID_ROWS; ++row) {
		for (let col = 0; col < GRID_COLUMNS; ++col) {
			const cellImageData: ImageData = workCtx.getImageData(
				Math.floor(cellWidth * col),
				Math.floor(cellHeight * row),
				Math.floor(cellWidth),
				Math.floor(cellHeight)
			);

			let blackPixelCount: number = 0;
			const pixelsInCell: number = cellImageData.data.length / 4;
			const blacknessThreshold: number = 30; /* feels a bit inappropriate lowk */

			for (let i = 0; i < cellImageData.data.length; i += 4) {
				const r = cellImageData.data[i];
				const g = cellImageData.data[i + 1];
				const b = cellImageData.data[i + 2];

				if (r < blacknessThreshold && g < blacknessThreshold && b < blacknessThreshold) {
					blackPixelCount++;
				}
			}

			const landRatio: number = blackPixelCount / pixelsInCell;
			const gridIndex: number = row * GRID_COLUMNS + col;
			const isMostlyLand: boolean = landRatio > landThreshold;

			occupancy[gridIndex] = !isMostlyLand;
		}
	}

	return occupancy;
};

export const getPlantSubgrid = (mouseGridCoords: Coords, plantDims: ObjectDims2d): Coords[] => {
	const leftCells = Math.floor((plantDims.width - 1) / 2);
	const topCells = Math.floor((plantDims.height - 1) / 2);

	let gridPaintStartX = mouseGridCoords.x - leftCells;
	let gridPaintStartY = mouseGridCoords.y - topCells;

	const gridPaintEndX = gridPaintStartX + plantDims.width;
	const gridPaintEndY = gridPaintStartY + plantDims.height;

	if (gridPaintEndX > GRID_COLUMNS) {
		gridPaintStartX -= gridPaintEndX - GRID_COLUMNS;
	}
	if (gridPaintEndY > GRID_ROWS) {
		gridPaintStartY -= gridPaintEndY - GRID_ROWS;
	}

	const coords: Coords[] = [];
	for (let row = Math.max(0, gridPaintStartY); row < Math.min(GRID_ROWS, gridPaintStartY + plantDims.height); ++row) {
		for (let col = Math.max(0, gridPaintStartX); col < Math.min(GRID_COLUMNS, gridPaintStartX + plantDims.width); ++col) {
			coords.push({ x: col, y: row });
		}
	}

	return coords;
};

export const linearizeGridIndex = (coords: Coords): number => {
	return coords.y * GRID_COLUMNS + coords.x;
};

export const isValidGridCoord = (x: number, y: number): boolean => {
	return x >= 0 && x < GRID_COLUMNS && y >= 0 && y < GRID_ROWS;
};
