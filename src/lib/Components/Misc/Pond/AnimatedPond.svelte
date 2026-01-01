<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { userThemePreference } from '$lib/stores/theme.svelte';
	import { fly } from 'svelte/transition';
	import DuckSelectionTile from './DuckSelectionTile.svelte';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type {
		Coords,
		duckPositionalData,
		OwnedDuck,
		OwnedPlantDto,
		UsedDuckDto,
		UsedPlantDto
	} from './duckTypes';
	import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';
	import { createInfiniteQuery, useQueryClient } from '@tanstack/svelte-query';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';

	let { userItems }: { userItems: { ducks: UsedDuckDto[]; plants: UsedPlantDto[] } } = $props();

	const queryClient = useQueryClient();

	let canvas: HTMLCanvasElement | null = $state(null);
	let workCanvas: HTMLCanvasElement | null = $state(null);
	
	let ctx: CanvasRenderingContext2D | null;
	let workCtx: CanvasRenderingContext2D | null;
	
	let imageIsLoaded: boolean = $state(false);
	let workCanvasPixelData: ImageData | null = null;

	const duckHeight: number = 100;
	const duckWidth: number = duckHeight * 1.07;

	let PondSelectedDucks: UsedDuckDto[] = $state(userItems.ducks);
	let placedPlants: UsedPlantDto[] = $state(userItems.plants);
	$inspect(placedPlants);

	const duckElements: Array<HTMLImageElement> = $state([]);
	const duckPositionalDataArr: Array<duckPositionalData> = $state([]);

	const idleGifPath: string = '/Idle.gif';
	const swimmingGifPath: string = '/Swimming.gif';

	const directionVectors: Array<{ x: number; y: number }> = [
		{ x: 0, y: -1 },
		{ x: 0.5, y: -0.5 },
		{ x: 1, y: 0 },
		{ x: 0.5, y: 0.5 },
		{ x: 0, y: 1 },
		{ x: -0.5, y: 0.5 },
		{ x: -1, y: 0 },
		{ x: -0.5, y: -0.5 }
	];

	const numDirections: number = directionVectors.length;

	const stepDistance: number = 120;
	const moveDuration: number = 182;
	const forwardBiasStrength: number = 0.3;

	const duckCollisionRadius: number = 60;
	const minDuckDistance: number = duckCollisionRadius * 2;

	let raf: number;

	let prevWidth: number = 0;
	let prevHeight: number = 0;

	let pondPath: string = $derived(
		`/src/lib/images/ponds/Homepage_${userThemePreference.theme}.png`
	);
	let workPondPath: string = $derived(`/src/lib/images/ponds/BlacknWhite.png`);

	let isGridVisible: boolean = $state(false);
	let isSelectionMenuVisible: boolean = $state(false);

	/* TODO: rank */
	let isDucksTabShown: boolean = $state(true);
	let isPlantsTabShown: boolean = $state(true);

	const gridColumns: number = 24;
	const gridRows: number = 11;

	const gridElements: number = gridColumns * gridRows;

	let isPointOnGridOccupied: boolean[] | undefined = $state();

	let mainElem: HTMLElement;

	const duckQuery = createInfiniteQuery({
		queryKey: ['OwnedDucks'],
		initialPageParam: 1,
		queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
			return await FetchFromApi<CustomPageData<OwnedDuck>>(
				'OwnedDucks',
				{
					method: 'GET'
				},
				fetch,
				new URLSearchParams({ page: `${pageParam}`, pageSize: '12' })
			);
		},
		getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<OwnedDuck>>) =>
			firstPage.body.prevCursor ?? undefined,
		getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<OwnedDuck>>) =>
			lastPage.body.nextCursor ?? undefined,
		select: (data: any) => data.pages.map((p: any) => p.body.items).flat()
	});

	const plantQuery = createInfiniteQuery({
		queryKey: ['OwnedPlants'],
		initialPageParam: 1,
		queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
			return await FetchFromApi<CustomPageData<OwnedPlantDto>>(
				'OwnedPlants',
				{
					method: 'GET'
				},
				fetch,
				new URLSearchParams({ page: `${pageParam}`, pageSize: '12' })
			);
		},
		getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<OwnedPlantDto>>) =>
			firstPage.body.prevCursor ?? undefined,
		getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<OwnedPlantDto>>) =>
			lastPage.body.nextCursor ?? undefined,
		select: (data: any) => data.pages.map((p: any) => p.body.items).flat()
	});

	$effect(() => {
		pondPath = pondPath;
		workPondPath = workPondPath;
		loadPond();
	});

	const getRelativeCoordinates = (
		e: MouseEvent,
		element: HTMLElement
	): { x: number; y: number } => {
		const rect: DOMRect = element.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	};

	const loadPond = (): void => {
		if (!ctx || !canvas || !workCtx || !workCanvas) return;

		const img: HTMLImageElement = new Image();
		const workImg: HTMLImageElement = new Image();

		let visualLoaded = false;
		let workLoaded = false;

		const containerWidth = canvas?.parentElement?.clientWidth ?? canvas?.clientWidth ?? 406;
		const containerHeight = canvas?.parentElement?.clientHeight ?? canvas?.clientHeight ?? 210;

		canvas!.width = containerWidth;
		canvas!.height = containerHeight;
		workCanvas!.width = containerWidth;
		workCanvas!.height = containerHeight;

		img.onload = () => {
			ctx!.drawImage(img, 0, 0, containerWidth, containerHeight);
			visualLoaded = true;
			if (workLoaded) imageIsLoaded = true;
		};

		workImg.onload = () => {
			workCtx!.drawImage(workImg, 0, 0, containerWidth, containerHeight);
			workCanvasPixelData = workCtx!.getImageData(0, 0, containerWidth, containerHeight);
			workLoaded = true;
			if (visualLoaded) imageIsLoaded = true;
		};

		img.src = pondPath;
		workImg.src = workPondPath;
	};

	const handleResize = (): void => {
		if (!canvas || !workCanvas || !ctx || !workCtx) return;

		const newWidth = canvas.parentElement?.clientWidth ?? canvas.clientWidth;
		const newHeight = canvas.parentElement?.clientHeight ?? canvas.clientHeight;

		if (newWidth === prevWidth && newHeight === prevHeight) return;

		const scaleX = prevWidth > 0 ? newWidth / prevWidth : 1;
		const scaleY = prevHeight > 0 ? newHeight / prevHeight : 1;

		canvas.width = newWidth;
		canvas.height = newHeight;
		workCanvas.width = newWidth;
		workCanvas.height = newHeight;

		const img = new Image();
		const workImg = new Image();

		let visualLoaded = false;
		let workLoaded = false;

		img.onload = () => {
			ctx!.drawImage(img, 0, 0, newWidth, newHeight);
			visualLoaded = true;
			if (workLoaded) finishResize();
		};

		workImg.onload = () => {
			workCtx!.drawImage(workImg, 0, 0, newWidth, newHeight);
			workCanvasPixelData = workCtx!.getImageData(0, 0, newWidth, newHeight);
			workLoaded = true;
			if (visualLoaded) finishResize();
		};

		const finishResize = () => {
			for (let i = 0; i < duckPositionalDataArr.length; i++) {
				const duck = duckPositionalDataArr[i];

				duck.x *= scaleX;
				duck.y *= scaleY;

				duck.startX *= scaleX;
				duck.startY *= scaleY;
				duck.targetX *= scaleX;
				duck.targetY *= scaleY;

				if (!isPositionValid(duck.x, duck.y)) {
					const centerX = newWidth / 2 - duckWidth / 2;
					const centerY = newHeight / 2 - duckHeight / 2;

					for (let t = 0; t <= 1; t += 0.1) {
						const testX = duck.x + (centerX - duck.x) * t;
						const testY = duck.y + (centerY - duck.y) * t;
						if (isPositionValid(testX, testY)) {
							duck.x = testX;
							duck.y = testY;
							duck.startX = testX;
							duck.startY = testY;
							duck.targetX = testX;
							duck.targetY = testY;
							duck.isMoving = false;
							break;
						}
					}
				}

				const duckElement = duckElements[i];
				if (duckElement) {
					duckElement.style.left = `${duck.x}px`;
					duckElement.style.top = `${duck.y}px`;
				}
			}

			prevWidth = newWidth;
			prevHeight = newHeight;
		};

		img.src = pondPath;
		workImg.src = workPondPath;
	};

	let resizeTimeout: ReturnType<typeof setTimeout>;

	const debouncedResize = () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(handleResize, 10);
	};

	const samplePixel = (col: number, row: number): Uint8ClampedArray | null => {
		if (!workCanvasPixelData || !imageIsLoaded) return null;

		const roundedCol = Math.floor(col);
		const roundedRow = Math.floor(row);

		if (
			roundedCol <= 0 ||
			roundedRow <= 0 ||
			roundedCol >= workCanvas!.width - 1 ||
			roundedRow >= workCanvas!.height - 1
		)
			return null;

		const width = workCanvas!.width;
		const pixelIndex = (roundedRow * width + roundedCol) * 4;

		return workCanvasPixelData.data.slice(pixelIndex, pixelIndex + 4);
	};

	const isPositionValid = (x: number, y: number): boolean => {
		if (!duckWidth || !duckHeight || !clientWidth || !clientHeight) return false;

		const checkPoints = [
			{ x: x, y: y },
			{ x: x + duckWidth, y: y },
			{ x: x, y: y + duckHeight },
			{ x: x + duckWidth, y: y + duckHeight },
			{ x: x + duckWidth / 2, y: y + duckHeight / 2 }
		];

		for (const point of checkPoints) {
			if (point.x < 0 || point.y < 0 || point.x >= clientWidth || point.y >= clientHeight) {
				return false;
			}

			const pixel = samplePixel(point.x, point.y);
			if (!pixel) return false;

			if (pixel[0] === 0 && pixel[1] === 0 && pixel[2] === 0 && pixel[3] === 255) {
				return false;
			}
		}

		return true;
	};

	const wouldCollideWithDucks = (x: number, y: number, excludeDuckIndex: number): boolean => {
		const centerX = x + duckWidth / 2;
		const centerY = y + duckHeight / 2;

		for (let i = 0; i < duckPositionalDataArr.length; i++) {
			if (i === excludeDuckIndex) continue;

			const otherDuck = duckPositionalDataArr[i];
			let otherX: number, otherY: number;

			if (otherDuck.isMoving) {
				const easedProgress = easeOutQuad(Math.min(otherDuck.moveProgress, 1));
				otherX = otherDuck.startX + (otherDuck.targetX - otherDuck.startX) * easedProgress;
				otherY = otherDuck.startY + (otherDuck.targetY - otherDuck.startY) * easedProgress;
			} else {
				otherX = otherDuck.x;
				otherY = otherDuck.y;
			}

			const otherCenterX = otherX + duckWidth / 2;
			const otherCenterY = otherY + duckHeight / 2;

			const dx = centerX - otherCenterX;
			const dy = centerY - otherCenterY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < minDuckDistance) {
				return true;
			}
		}

		return false;
	};

	const isPositionValidForDuck = (x: number, y: number, duckIndex: number): boolean => {
		if (!isPositionValid(x, y)) return false;
		if (wouldCollideWithDucks(x, y, duckIndex)) return false;
		return true;
	};

	const easeOutQuad = (t: number): number => {
		return 1 - (1 - t) * (1 - t);
	};

	const getMaxSafeDistanceForDuck = (
		startX: number,
		startY: number,
		dirIndex: number,
		duckIndex: number,
		maxDist: number = stepDistance * 3
	): number => {
		const dir = directionVectors[dirIndex];

		const endX = startX + dir.x * maxDist;
		const endY = startY + dir.y * maxDist;

		if (isPositionValidForDuck(endX, endY, duckIndex)) {
			return maxDist;
		}

		let minSafe = 0;
		let maxUnsafe = maxDist;
		const precision = 2;

		while (maxUnsafe - minSafe > precision) {
			const mid = (minSafe + maxUnsafe) / 2;
			const testX = startX + dir.x * mid;
			const testY = startY + dir.y * mid;

			if (isPositionValidForDuck(testX, testY, duckIndex)) {
				minSafe = mid;
			} else {
				maxUnsafe = mid;
			}
		}

		return minSafe;
	};

	const clipMovementForDuck = (
		startX: number,
		startY: number,
		dirIndex: number,
		targetDistance: number,
		duckIndex: number
	): number => {
		const dir = directionVectors[dirIndex];

		const endX = startX + dir.x * targetDistance;
		const endY = startY + dir.y * targetDistance;

		if (isPositionValidForDuck(endX, endY, duckIndex)) {
			return targetDistance;
		}

		const safeDistance = getMaxSafeDistanceForDuck(
			startX,
			startY,
			dirIndex,
			duckIndex,
			targetDistance
		);

		const buffer = 5;
		return Math.max(0, safeDistance - buffer);
	};

	const normalize = (arr: Array<number>): number[] => {
		let sum: number = arr.reduce((a, b) => a + b, 0);
		if (sum === 0) return arr.map(() => 1 / arr.length);
		return arr.map((el) => el / sum);
	};

	const weightedRandomSelect = (probabilities: number[]): number => {
		const random = Math.random();
		let sum = 0;

		for (let i = 0; i < probabilities.length; i++) {
			sum += probabilities[i];
			if (random <= sum) {
				return i;
			}
		}

		return probabilities.length - 1;
	};

	const pickNewDirection = (duckIndex: number): void => {
		const duck = duckPositionalDataArr[duckIndex];
		const currentDir = duck.directionIndex;

		const weights: number[] = [];
		const safeDistances: number[] = [];

		for (let i = 0; i < numDirections; i++) {
			const safeDistance = clipMovementForDuck(duck.x, duck.y, i, stepDistance, duckIndex);
			safeDistances.push(safeDistance);

			const dirDiff = Math.min(Math.abs(i - currentDir), numDirections - Math.abs(i - currentDir));
			const forwardBias = 1 + forwardBiasStrength * (numDirections / 2 - dirDiff);

			const weight = safeDistance > 5 ? safeDistance * forwardBias : 0;
			weights.push(weight);
		}

		const totalWeight = weights.reduce((a, b) => a + b, 0);
		if (totalWeight === 0) {
			duck.framesUntilNewDirection = 10;
			return;
		}

		const probabilities = normalize(weights);
		const selectedDirection = weightedRandomSelect(probabilities);

		const safeDistance = safeDistances[selectedDirection];

		if (safeDistance > 5) {
			const dir = directionVectors[selectedDirection];
			duck.directionIndex = selectedDirection;
			duck.startX = duck.x;
			duck.startY = duck.y;
			duck.targetX = duck.x + dir.x * safeDistance;
			duck.targetY = duck.y + dir.y * safeDistance;
			duck.moveProgress = 0;
			duck.isMoving = true;
		}

		duck.framesUntilNewDirection = Math.floor(Math.random() * 60) + 30;
	};

	const spawnDuck = async (duck: UsedDuckDto, duckIndex: number) => {
		if (!clientHeight || !clientWidth || !duckWidth || !duckHeight) return;
		const centerX: number = clientWidth / 2 - duckWidth / 2;
		const centerY: number = clientHeight / 2 - duckHeight / 2;
		let duckSpawnX: number;
		let duckSpawnY: number;
		let attempts = 0;
		const maxAttempts = 50;

		do {
			const angle =
				(duckIndex / PondSelectedDucks.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
			const radius = minDuckDistance * 0.6 * (1 + duckIndex * 0.5) + Math.random() * 20;

			duckSpawnX = centerX + Math.cos(angle) * radius;
			duckSpawnY = centerY + Math.sin(angle) * radius;

			attempts++;

			if (attempts >= maxAttempts) break;
		} while (
			!isPositionValid(duckSpawnX, duckSpawnY) ||
			wouldCollideWithDucks(duckSpawnX, duckSpawnY, duckIndex)
		);

		const startingDirection: number = Math.floor(Math.random() * numDirections);

		duckPositionalDataArr.push({
			x: duckSpawnX,
			y: duckSpawnY,
			startX: duckSpawnX,
			startY: duckSpawnY,
			targetX: duckSpawnX,
			targetY: duckSpawnY,
			directionIndex: startingDirection,
			moveProgress: 1,
			isMoving: false,
			isSwimming: false,
			framesUntilNewDirection: Math.floor(Math.random() * 30)
		});

		duckElements[duckIndex].style.left = `${duckSpawnX}px`;
		duckElements[duckIndex].style.top = `${duckSpawnY}px`;
	};

	const loadDucks = async (): Promise<void> => {
		PondSelectedDucks.forEach((d, i) => {
			spawnDuck(d, i);
		});
		raf = requestAnimationFrame(animateDucks);
	};

	const animateDucks = (): void => {
		for (let duckIndex = 0; duckIndex < PondSelectedDucks.length; ++duckIndex) {
			if (!duckPositionalDataArr[duckIndex]) continue;
			const duck = duckPositionalDataArr[duckIndex];
			const duckElement: HTMLImageElement = duckElements[duckIndex];

			if (duck.isMoving) {
				if (!duck.isSwimming) {
					duck.isSwimming = true;
					duckElement.src = `${swimmingGifPath}?t=${Date.now()}`;
				}

				duck.moveProgress += 1 / moveDuration;

				if (duck.moveProgress >= 1) {
					duck.moveProgress = 1;
					duck.isMoving = false;
					duck.x = duck.targetX;
					duck.y = duck.targetY;

					duck.isSwimming = false;
					duckElement.src = `${idleGifPath}?t=${Date.now()}`;
				}

				const easedProgress = easeOutQuad(Math.min(duck.moveProgress, 1));

				const visualX = duck.startX + (duck.targetX - duck.startX) * easedProgress;
				const visualY = duck.startY + (duck.targetY - duck.startY) * easedProgress;

				duckElement.style.left = `${visualX}px`;
				duckElement.style.top = `${visualY}px`;

				if (duck.directionIndex > 3) {
					duckElement.style.transform = 'scaleX(1)';
				} else {
					duckElement.style.transform = 'scaleX(-1)';
				}
			} else {
				duck.framesUntilNewDirection--;

				if (duck.framesUntilNewDirection <= 0) {
					pickNewDirection(duckIndex);
				}

				duckElement.style.left = `${duck.x}px`;
				duckElement.style.top = `${duck.y}px`;
			}
		}

		raf = requestAnimationFrame(animateDucks);
	};

	onMount(() => {
		ctx = canvas!.getContext('2d');
		workCtx = workCanvas!.getContext('2d', { willReadFrequently: true });

		prevWidth = canvas?.parentElement?.clientWidth ?? canvas?.clientWidth ?? 406;
		prevHeight = canvas?.parentElement?.clientHeight ?? canvas?.clientHeight ?? 210;

		loadPond();
		setTimeout(async () => {
			await tick();
			loadDucks();
		});

		window.addEventListener('resize', debouncedResize);

		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', debouncedResize);
		}

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(resizeTimeout);
			window.removeEventListener('resize', debouncedResize);
			if (window.visualViewport) {
				window.visualViewport.removeEventListener('resize', debouncedResize);
			}
		};
	});

	let clientHeight: number | undefined = $state();
	let clientWidth: number | undefined = $state();

	$effect(() => {
		if (clientWidth !== undefined && clientHeight !== undefined) {
			debouncedResize();
		}
	});

	const highlightCell = (coords: { x: number; y: number }[]) => {
		if (!gridCanvas || !mainElem) return;
		drawGrid(gridCanvas);
		const ctx = gridCanvas.getContext('2d');
		if (!ctx) return;

		const mainRect = mainElem.getBoundingClientRect();
		const visualWidth = mainRect.width;
		const visualHeight = mainRect.height;

		const cellWidth = visualWidth / gridColumns;
		const cellHeight = visualHeight / gridRows;

		coords.forEach((c) => {
			const linearizedGridIndex: number = c.y * gridColumns + c.x;

			if (!!isPointOnGridOccupied?.at(linearizedGridIndex)) {
				ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
			} else {
				ctx.fillStyle = 'rgba(68, 239, 68, 0.5)';
			}

			ctx.fillRect(c.x * cellWidth, c.y * cellHeight, cellWidth, cellHeight);
		});
	};

	let gridCanvas: HTMLCanvasElement | undefined = $state();

	const InitializeGridData = (): void => {
		if (!workCtx || !clientWidth || !clientHeight) return;
		if (isPointOnGridOccupied) return;

		isPointOnGridOccupied = Array(gridElements).fill(false);

		const cellWidth = clientWidth / gridColumns;
		const cellHeight = clientHeight / gridRows;

		for (let row = 0; row < gridRows; ++row) {
			for (let col = 0; col < gridColumns; ++col) {
				const cellImageData: ImageData = workCtx.getImageData(
					Math.floor(cellWidth * col),
					Math.floor(cellHeight * row),
					Math.floor(cellWidth),
					Math.floor(cellHeight)
				);

				let blackPixelCount = 0;
				const pixelsInCell = cellImageData.data.length / 4;

				for (let i = 0; i < cellImageData.data.length; i += 4) {
					const r = cellImageData.data[i];
					const g = cellImageData.data[i + 1];
					const b = cellImageData.data[i + 2];

					if (r < 30 && g < 30 && b < 30) {
						blackPixelCount++;
					}
				}

				const landRatio = blackPixelCount / pixelsInCell;
				const gridIndex = row * gridColumns + col;

				const isMostlyLand = landRatio > 0.8;

				isPointOnGridOccupied[gridIndex] = !isMostlyLand;
			}
		}
		placedPlants.forEach((plant) => {
			if (!isPointOnGridOccupied) return;
			for (let row = plant.gridY; row < plant.gridY + plant.height; ++row) {
				for (let col = plant.gridX; col < plant.gridX + plant.width; ++col) {
					if (row >= 0 && row < gridRows && col >= 0 && col < gridColumns) {
						const gridIndex = row * gridColumns + col;
						isPointOnGridOccupied[gridIndex] = true;
					}
				}
			}
		});
	};

	const drawGrid = (node: HTMLCanvasElement) => {
		if (!mainElem) return;
		InitializeGridData();

		const mainRect = mainElem.getBoundingClientRect();
		const visualWidth = mainRect.width;
		const visualHeight = mainRect.height;

		node.width = visualWidth;
		node.height = visualHeight;

		const ctx = node.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, visualWidth, visualHeight);
		ctx.strokeStyle = 'rgba(55, 65, 81, 0.5)';
		ctx.lineWidth = 1;

		const cellWidth = visualWidth / gridColumns;
		const cellHeight = visualHeight / gridRows;

		for (let i = 0; i <= gridColumns; i++) {
			const x = Math.floor(i * cellWidth) + 0.5;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, visualHeight);
			ctx.stroke();
		}

		for (let i = 0; i <= gridRows; i++) {
			const y = Math.floor(i * cellHeight) + 0.5;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(visualWidth, y);
			ctx.stroke();
		}
	};

	const getSubgridForPlant = (mouseCoords: Coords, plant: OwnedPlantDto): Coords[] => {
		const leftCells: number = Math.floor((plant.width - 1) / 2);
		const topCells: number = Math.floor((plant.height - 1) / 2);

		let gridPaintStartX: number = mouseCoords.x - leftCells;
		let gridPaintStartY: number = mouseCoords.y - topCells;

		const gridPaintEndX = gridPaintStartX + plant.width;
		const gridPaintEndY = gridPaintStartY + plant.height;

		if (gridPaintEndX >= gridColumns) {
			const diff: number = gridPaintEndX - gridColumns;
			gridPaintStartX -= diff;
		}

		if (gridPaintEndY >= gridRows) {
			const diff: number = gridPaintEndY - gridRows;
			gridPaintStartY -= diff;
		}

		let coords: Coords[] = [];
		for (let row = Math.max(0, gridPaintStartY); row < gridPaintEndY; ++row) {
			for (let col = Math.max(0, gridPaintStartX); col < gridPaintEndX; ++col) {
				coords.push({ x: col, y: row });
			}
		}

		return coords;
	};
</script>

<main bind:this={mainElem} bind:clientHeight bind:clientWidth class="relative h-full w-full">
	{#each placedPlants as placedPlant}
		<div class="absolute z-200 flex flex-col justify-center items-center"
			style="width: {placedPlant.width * (clientWidth / gridColumns)}px; 
				height: {placedPlant.height * (clientHeight / gridRows)}px; 
				left: {placedPlant.gridX * (clientWidth / gridColumns)}px; 
				top: {placedPlant.gridY * (clientHeight / gridRows)}px;">
			<img src={`https://d3018wbyyxg1xc.cloudfront.net/Plants/${placedPlant.itemId}.png`} alt="plant" srcset="">
		</div>
	{/each}

	{#if isGridVisible}
		<canvas bind:this={gridCanvas} class="absolute z-901" use:drawGrid></canvas>
	{/if}

	{#if isSelectionMenuVisible}
		{@render SelectionMenu(userItems.ducks, userItems.plants)}
	{:else}
		<button
			onclick={() => {
				isSelectionMenuVisible = true;
			}}
			class="fixed top-[calc(50%-20em)] left-0 z-999 h-40 w-12 bg-red-500"
		>
			huh
		</button>
	{/if}

	<canvas
		class="absolute z-10"
		bind:this={canvas}
		style="width: {clientWidth}px; height: {clientHeight}px;"
	></canvas>
	<canvas class="absolute z-0 hidden" bind:this={workCanvas}></canvas>
	{#each PondSelectedDucks as duck, i}
		<img
			src={idleGifPath}
			alt="duck"
			class="rounded-100 absolute z-20 overflow-hidden"
			style="height: {duckHeight}px;"
			bind:this={duckElements[i]}
		/>
	{/each}
</main>

{#snippet DuckTab()}
	<div class="flex h-full flex-col">
		<div class="h-12 w-full flex-shrink-0 px-3">
			<h4 class="border-b-2 border-b-black py-2 text-lg font-semibold">Owned ducks</h4>
		</div>
		<div class="grid min-h-0 w-full flex-1 grid-cols-4 gap-3 overflow-y-auto p-5">
			{#each $duckQuery.data as duck, i}
				<DuckSelectionTile
					options={{
						duck: duck,
						onclick: async () => {
							const endpoint = duck.isSelectedForPond ? 'DropItem' : 'SelectItem';

							await FetchFromApi(
								endpoint,
								{
									method: 'PUT',
									body: JSON.stringify({ itemId: duck.itemId })
								},
								fetch
							);

							if (!duck.isSelectedForPond) {
								let newLenght: number = PondSelectedDucks.push(duck);
								spawnDuck(duck, newLenght - 1);
							} else {
								PondSelectedDucks = PondSelectedDucks.filter((d) => d.itemId !== duck.itemId);
							}
							console.log($duckQuery.data);

							queryClient.setQueryData(['OwnedDucks'], (oldData: any) => {
								if (!oldData) return oldData;
								return {
									...oldData,
									pages: oldData.pages.map((page: any) => ({
										...page,
										body: {
											...page.body,
											items: page.body.items.map((d: OwnedDuck) =>
												d.itemId === duck.itemId
													? { ...d, isSelectedForPond: duck.isSelectedForPond ? false : true }
													: d
											)
										}
									}))
								};
							});
						}
					}}
				/>
			{/each}
		</div>
	</div>

{/snippet}

{#snippet PlantTab()}
	<div class="flex h-full flex-col">
		<div class="h-12 w-full flex-shrink-0 px-3">
			<h4 class="border-b-2 border-b-black py-2 text-lg font-semibold">Owned plants</h4>
		</div>
		<div class="grid min-h-0 w-full flex-1 grid-cols-4 gap-3 overflow-y-auto p-5">
			{#each $plantQuery.data as plant}
				<div
					class="relative flex aspect-square w-full items-center justify-center rounded-[25%] bg-blue-500 p-[15%]"
				>
					<button
						class="h-full w-full"
						{@attach (node) => {
							let startingHeight: number;
							let startingWidth: number;

							let startingX: number;
							let startingY: number;

							let gridElemIndexX: number;
							let gridElemIndexY: number;

							const handleMouseMove = (e: MouseEvent) => {
								if (!mainElem) return;

								const relCoords = getRelativeCoordinates(e, mainElem);
								const mainRect = mainElem.getBoundingClientRect();

								const cellWidth = mainRect.width / gridColumns;
								const cellHeight = mainRect.height / gridRows;

								gridElemIndexX = Math.floor(relCoords.x / cellWidth);
								gridElemIndexY = Math.floor(relCoords.y / cellHeight);

								gridElemIndexX = Math.max(0, Math.min(gridColumns - 1, gridElemIndexX));
								gridElemIndexY = Math.max(0, Math.min(gridRows - 1, gridElemIndexY));

								highlightCell(getSubgridForPlant({ x: gridElemIndexX, y: gridElemIndexY }, plant));

								const dx: number = startingX - e.clientX;
								const dy: number = startingY - e.clientY;

								node.style.transform = `translateX(${-dx}px) translateY(${-dy}px)`;
							};

							const handleMouseUp = async () => {
								node.style.transform = '';
								node.style.position = '';
								node.style.width = '';
								node.style.height = '';

								document.removeEventListener('mousemove', handleMouseMove);
								document.removeEventListener('mouseup', handleMouseUp);

								isGridVisible = false;
								isSelectionMenuVisible = true;

								if (!clientHeight || !clientWidth || !mainElem) return;

								let plantSubgrid: Coords[] = getSubgridForPlant(
									{ x: gridElemIndexX, y: gridElemIndexY },
									plant
								);

								let illegalCells: Coords[] = plantSubgrid.filter((c) => {
									const linearizedGridIndex: number = c.y * gridColumns + c.x;
									return isPointOnGridOccupied?.at(linearizedGridIndex);
								});

								console.log(illegalCells);

								const rowWidth: number = clientWidth / gridColumns;
								const rowHeight: number = clientHeight / gridRows;

								if (illegalCells.length != 0) {
									// TODO: signal illegal cells
									return;
								}

								if (isPointOnGridOccupied) {
									plantSubgrid.forEach((c) => {
										const linearizedGridIndex: number = c.y * gridColumns + c.x;
										isPointOnGridOccupied![linearizedGridIndex] = true;
									});
								}

								let res = await FetchFromApi('EmplacePlant', {
									method: 'PUT',
									body: JSON.stringify({
										itemId: plant.itemId,
										gridX: plantSubgrid[0].x,
										gridY: plantSubgrid[0].y
									})
								});
								if (res.status === 'Success') {
									placedPlants.push({
										gridX: plantSubgrid[0].x,
										gridY: plantSubgrid[0].y,
										width: plant.width,
										height: plant.height,
										itemId: plant.itemId
									} as UsedPlantDto);
								}
							};

							node.onmousedown = (e: MouseEvent) => {
								let imgDomRect: DOMRect = node.getBoundingClientRect();

								startingHeight = imgDomRect.height;
								startingWidth = imgDomRect.width;
								node.style.width = `${startingWidth}px`;
								node.style.height = `${startingHeight}px`;
								node.style.position = 'fixed';

								startingX = imgDomRect.left + startingWidth / 2;
								startingY = imgDomRect.top + startingHeight / 2;

								document.addEventListener('mousemove', handleMouseMove);
								document.addEventListener('mouseup', handleMouseUp);

								isGridVisible = true;
								isSelectionMenuVisible = false;
							};
						}}
					>
						<img
							class="pointer-events-none h-full w-full select-none"
							src="/src/lib/images/store/plant.png"
							alt="plant"
						/>
					</button>
				</div>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet SelectionMenu(ducks: UsedDuckDto[], plants: UsedPlantDto[])}
	<div
		transition:fly={{ x: -50, opacity: 0 }}
		class="absolute top-[10%] left-5 z-500 h-[60%] w-xl rounded-xl bg-red-500"
	>
		<div class="flex h-full w-full flex-col justify-center">
			<button
				onclick={() => {
					isSelectionMenuVisible = false;
				}}
				class="absolute top-3 right-3 h-8 w-8 rounded-[25%] bg-blue-500 p-1"
			>
				<CrossIconSvg options={{ class: 'w-full h-full stroke-[2] stroke-black' }} />
			</button>
			<div class="flex h-16 w-full flex-row justify-start gap-3 p-3">
				<button
					onclick={() => {
						isPlantsTabShown = false;
						isDucksTabShown = true;
					}}
					class="h-full w-30 rounded-md bg-amber-500">ducks</button
				>
				<button
					onclick={() => {
						isPlantsTabShown = true;
						isDucksTabShown = false;
					}}
					class="h-full w-30 rounded-md bg-amber-500">plants</button
				>
			</div>
			<div class="h-full w-full overflow-hidden">
				{#if isDucksTabShown}
					{@render DuckTab()}
				{:else if isPlantsTabShown}
					{@render PlantTab()}
				{/if}
			</div>
		</div>
	</div>
{/snippet}
