<script lang="ts">
	import { onMount, tick } from "svelte";
	import { userThemePreference } from "$lib/stores/theme.svelte";
	import ThreeDotIconSvg from "$lib/svg/EditorComponentIcons/ThreeDotIconSvg.svelte";
	import { style } from "motion/react-client";
	import { fly } from "svelte/transition";
	import DuckSelectionTile from "./DuckSelectionTile.svelte";

	let { userDucks }: { userDucks: { id: string }[] } = $props();

	interface rgba {
		r: number;
		g: number;
		b: number;
		a: number;
	}

	const shoreColor: rgba = {
		r: 0,
		g: 0,
		b: 0,
		a: 255
	};

	interface duckPositionalData {
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

	let canvas: HTMLCanvasElement | null = $state(null);
	let workCanvas: HTMLCanvasElement | null = $state(null);

	let ctx: CanvasRenderingContext2D | null;
	let workCtx: CanvasRenderingContext2D | null;

	let imageIsLoaded: boolean = $state(false);
	let workCanvasPixelData: ImageData | null = null;

	const duckWidth: number = 100;
	const duckHeight: number = 54

	let ducks: { id: string }[] = $state(userDucks);
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

	let pondPath: string = $derived(`/src/lib/images/ponds/Homepage_${userThemePreference.theme}.png`);
	let workPondPath: string = $derived(`/src/lib/images/ponds/BlacknWhite.png`);

	$effect(() => {
		pondPath = pondPath;
		workPondPath = workPondPath;
		loadPond();
	});

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

		if (roundedCol <= 0 || roundedRow <= 0 || roundedCol >= workCanvas!.width - 1 || roundedRow >= workCanvas!.height - 1)
			return null;

		const width = workCanvas!.width;
		const pixelIndex = (roundedRow * width + roundedCol) * 4;

		return workCanvasPixelData.data.slice(pixelIndex, pixelIndex + 4);
	};

	const doesPixelMatchColor = (pixel: Uint8ClampedArray, color: rgba): boolean => {
		return pixel[0] === color.r && pixel[1] === color.g && pixel[2] === color.b && pixel[3] === color.a;
	};

	const isPositionValid = (x: number, y: number): boolean => {
		if (!duckWidth || !duckHeight || !clientWidth || !clientHeight) return false;

		const centerX = x + Math.floor(duckWidth / 2);
		const centerY = y + Math.floor(duckHeight / 2);

		if (centerX < 0 || centerY < 0 || centerX >= clientWidth || centerY >= clientHeight) {
			return false;
		}

		const pixel = samplePixel(centerX, centerY);
		if (!pixel) return false;

		return !doesPixelMatchColor(pixel, shoreColor);
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

	const getMaxSafeDistance = (startX: number, startY: number, dirIndex: number, maxDist: number = stepDistance * 3): number => {
		const dir = directionVectors[dirIndex];
		
		const endX = startX + dir.x * maxDist;
		const endY = startY + dir.y * maxDist;

		if (isPositionValid(endX, endY)) {
			return maxDist;
		}

		let minSafe = 0;
		let maxUnsafe = maxDist;
		const precision = 2;

		while (maxUnsafe - minSafe > precision) {
			const mid = (minSafe + maxUnsafe) / 2;
			const testX = startX + dir.x * mid;
			const testY = startY + dir.y * mid;

			if (isPositionValid(testX, testY)) {
				minSafe = mid;
			} else {
				maxUnsafe = mid;
			}
		}

		return minSafe;
	};

	const getMaxSafeDistanceForDuck = (startX: number, startY: number, dirIndex: number, duckIndex: number, maxDist: number = stepDistance * 3): number => {
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

	const clipMovement = (startX: number, startY: number, dirIndex: number, targetDistance: number): number => {
		const dir = directionVectors[dirIndex];
		
		const endX = startX + dir.x * targetDistance;
		const endY = startY + dir.y * targetDistance;
		
		if (isPositionValid(endX, endY)) {
			return targetDistance;
		}

		const safeDistance = getMaxSafeDistance(startX, startY, dirIndex, targetDistance);
		
		const buffer = 5;
		return Math.max(0, safeDistance - buffer);
	};

	const clipMovementForDuck = (startX: number, startY: number, dirIndex: number, targetDistance: number, duckIndex: number): number => {
		const dir = directionVectors[dirIndex];
		
		const endX = startX + dir.x * targetDistance;
		const endY = startY + dir.y * targetDistance;
		
		if (isPositionValidForDuck(endX, endY, duckIndex)) {
			return targetDistance;
		}

		const safeDistance = getMaxSafeDistanceForDuck(startX, startY, dirIndex, duckIndex, targetDistance);
		
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

			const dirDiff = Math.min(
				Math.abs(i - currentDir),
				numDirections - Math.abs(i - currentDir)
			);
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

	const spawnDuck = async (duck: string, duckIndex: number) => {
		if (!clientHeight || !clientWidth || !duckWidth || !duckHeight) return;
		const centerX: number = clientWidth / 2 - duckWidth / 2; 
		const centerY: number = clientHeight / 2 - duckHeight / 2; 
		let duckSpawnX: number;
			let duckSpawnY: number;
			let attempts = 0;
			const maxAttempts = 50;

			do {
				const angle = (duckIndex / ducks.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
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
	}

	const loadDucks = async (): Promise<void> => {
		ducks.forEach((d, i) => {
			spawnDuck(d.id, i);
		})		
		raf = requestAnimationFrame(animateDucks);
	};

	const animateDucks = (): void => {
		for (let duckIndex = 0; duckIndex < ducks.length; ++duckIndex) {
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
		workCtx = workCanvas!.getContext('2d');
		
		prevWidth = canvas?.parentElement?.clientWidth ?? canvas?.clientWidth ?? 406;
		prevHeight = canvas?.parentElement?.clientHeight ?? canvas?.clientHeight ?? 210;
		
		loadPond();
		setTimeout(loadDucks, 10);

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

	let clientHeight: number | undefined = $state()
	let clientWidth: number | undefined = $state()

	$effect(() => {
		if (clientWidth !== undefined && clientHeight !== undefined) {
			debouncedResize();
		}
	});

	let isGridVisible: boolean = $state(false);
	let isSelectionMenuVisible: boolean = $state(false);

	/* TODO: rank */
	let isDucksTabShown: boolean = $state(true);
	let isPlantsTabShown: boolean = $state(true);
	
	const gridColumns: number = 24;
	const gridRows: number = 11;

	const gridElements: number = gridColumns * gridRows;

	let grid: GridElement[] = $state(Array(gridElements).fill({ isOccupied: false } as GridElement));

	type GridElement = {
		div: HTMLDivElement
		isOccupied: boolean
	}
	type PlacedPlant = {
		imageSrc: string,
		relativeX: number,
		relativeY: number,  
		widthRatio: number, 
		heightRatio: number  
	}

	let mainElemBoundingRect: number | undefined = $state();
	let mainElem: HTMLElement;

	let placedPlants: PlacedPlant[] = $state([]);

	 const highlightCell = (gridX: number, gridY: number) => {
		if (!gridCanvas) return;
		drawGrid(gridCanvas);
        const ctx = gridCanvas.getContext('2d');
        if (!ctx || !clientWidth || !clientHeight) return;
        console.log('fillign');
        const cellWidth = clientWidth / gridColumns;
        const cellHeight = clientHeight / gridRows;
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.fillRect(gridX * cellWidth, gridY * cellHeight, cellWidth, cellHeight);
    };

	let gridCanvas: HTMLCanvasElement | undefined = $state();

	const drawGrid = (node: HTMLCanvasElement) => {
		if (!clientWidth || !clientHeight) return;
			
		node.width = clientWidth;
		node.height = clientHeight;
		
		const ctx = node.getContext('2d');
		if (!ctx) return;
		
		ctx.clearRect(0, 0, clientWidth, clientHeight);
		ctx.strokeStyle = 'rgba(55, 65, 81, 0.5)';
		ctx.lineWidth = 1; 
		
		const cellWidth = clientWidth / gridColumns;
		const cellHeight = clientHeight / gridRows;
		
		for (let i = 0; i <= gridColumns; i++) {
			const x = Math.floor(i * cellWidth) + 0.5;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, clientHeight);
			ctx.stroke();
		}
		
		for (let i = 0; i <= gridRows; i++) {
			const y = Math.floor(i * cellHeight) + 0.5;
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(clientWidth, y);
			ctx.stroke();
		}
	}
</script>


<main bind:this={mainElem} bind:offsetHeight={mainElemBoundingRect} bind:clientHeight bind:clientWidth class="relative w-full h-full">

{#each placedPlants as placedPlant}
    <img 
        class="absolute z-200" 
        style="
            width: {placedPlant.widthRatio * (clientWidth ?? 0)}px; 
            height: {placedPlant.heightRatio * (clientHeight ?? 0)}px; 
            left: {placedPlant.relativeX * (clientWidth ?? 0)}px; 
            top: {placedPlant.relativeY * (clientHeight ?? 0)}px;
        "
        src={placedPlant.imageSrc} 
        alt="plant">
{/each}

	{#if isGridVisible}
		<canvas bind:this={gridCanvas} class="absolute z-901" width={clientWidth ?? 0} height={clientHeight ?? 0} style="width: {clientWidth}px; height: {clientHeight}px;" use:drawGrid></canvas>
	{/if}
	
	{#if isSelectionMenuVisible}
		<div transition:fly={{ x: -50, opacity: 0 }} class="w-xl h-[60%] bg-red-500 left-5 top-[10%] absolute z-500 flex flex-col justify-center">
			<div class="w-full h-16 flex flex-row justify-start p-3 gap-3">
				<button onclick={() => {isPlantsTabShown = false; isDucksTabShown = true;}} class="h-full w-30 bg-amber-500 rounded-md">ducks</button>
				<button onclick={() => {isPlantsTabShown = true; isDucksTabShown = false;}} class="h-full w-30 bg-amber-500 rounded-md">plants</button>
			</div>
			<div class="w-full h-full overflow-hidden">		
				{#if isDucksTabShown}	
					{@render DuckTab()}
				{:else if isPlantsTabShown}
					{@render PlantTab()}					
				{/if}
			</div>
		</div>
	{:else}
		<button onclick={() => { isSelectionMenuVisible = true }} class="w-12 h-40 fixed left-0 top-[calc(50%-20em)] z-999 bg-red-500">
			huh
		</button>
	{/if}

	<canvas class="absolute z-10" bind:this={canvas} style="width: {clientWidth}px; height: {clientHeight}px;"></canvas>
	<canvas class="absolute z-0 hidden" bind:this={workCanvas}></canvas>
	{#each ducks as duck, i}
		<img 
			src={idleGifPath}
			alt="duck"
			class="absolute z-20 rounded-100 overflow-hidden"
			style="height: {duckWidth}px;"
			bind:this={duckElements[i]}
		/>
	{/each}
</main>

{#snippet DuckTab()}
	<div class="flex flex-col h-full">
		<div class="w-full h-12 px-3 flex-shrink-0">
			<h4 class="text-lg font-semibold border-b-2 border-b-black py-2">Owned ducks</h4>
		</div>
		<div class="w-full flex-1 min-h-0 p-5 grid grid-cols-4 gap-3 overflow-y-auto">
			{#each [...Array(100).keys()] as duck}
				<DuckSelectionTile options={{ onclick: async () => {
					let duck = {id: ""}
					ducks.push(duck);
					await tick();
					spawnDuck(duck.id, 4);
				}}}/>
			{/each}
		</div>
	</div>
{/snippet}


{#snippet PlantTab()}
	<div class="flex flex-col h-full">
		<div class="w-full h-12 px-3 flex-shrink-0">
			<h4 class="text-lg font-semibold border-b-2 border-b-black py-2">Owned plants</h4>
		</div>
		<div class="w-full flex-1 min-h-0 p-5 grid grid-cols-4 gap-3 overflow-y-auto">
		{#each [...Array(15).keys()] as duck}
			<div class="w-full flex items-center justify-center p-[15%] relative aspect-square rounded-[25%] bg-blue-500">
				<button class="w-full h-full" {@attach node => {
					let startingHeight: number;
					let startingWidth: number;

					const mainOffset: number = mainElem.getBoundingClientRect().top; // include how header affects y reporting

					let startingX: number;
					let startingY: number;

					let gridElemIndexX: number
					let gridElemIndexY: number

					const handleMouseMove = (e: MouseEvent) => {
						const dx: number = startingX - e.clientX;
						const dy: number = startingY - e.clientY;

						gridElemIndexX = Math.floor(e.clientX / startingWidth);
						gridElemIndexY = Math.floor((e.clientY - mainOffset) / startingWidth);

						node.style.transform = `translateX(${-dx}px) translateY(${-dy}px)`;

						highlightCell(gridElemIndexX, gridElemIndexY);
					}

					const handleMouseUp = () => {
						node.style.transform = '';
						node.style.position = '';
						node.style.width = '';
						node.style.height = '';

						document.removeEventListener('mousemove', handleMouseMove);
						document.removeEventListener('mouseup', handleMouseUp);

						isGridVisible = false;
						isSelectionMenuVisible = true;
						
						const mainRect: DOMRect = mainElem.getBoundingClientRect();

						if (!clientHeight || !clientWidth) return;
						const rowWidth: number = (clientWidth / gridColumns)
						const rowHeight: number = (clientHeight / gridRows)
						placedPlants.push({
							relativeX: (gridElemIndexX * rowWidth - mainRect.left) / mainRect.width,
							relativeY: (gridElemIndexY * rowHeight) / mainRect.height,
							widthRatio: rowWidth / mainRect.width,
							heightRatio: rowHeight / mainRect.height,
							imageSrc: "/src/lib/images/store/plant.png"
						})
					}

					node.onmousedown = () => {
						let imgDomRect: DOMRect = node.getBoundingClientRect();

						startingHeight = imgDomRect.height;
						startingWidth = imgDomRect.width;
						node.style.width = `${startingWidth}px`;
						node.style.height = `${startingHeight}px`;
						node.style.position = 'fixed';

						startingX = imgDomRect.left + startingWidth / 2
						startingY = imgDomRect.top + startingHeight / 2
						document.addEventListener('mousemove', handleMouseMove);
						document.addEventListener('mouseup', handleMouseUp);

						isGridVisible = true;
						isSelectionMenuVisible = false;
					}
				}}>
					<img class="w-full h-full select-none pointer-events-none" src="/src/lib/images/store/plant.png" alt="plant">
				</button>
			</div>
		{/each}
	</div>
	</div>
{/snippet}