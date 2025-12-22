<script lang="ts">
	import { onMount } from "svelte";
	import { userThemePreference } from "$lib/stores/theme.svelte";

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

	let canvasComputedStyle: CSSStyleDeclaration | null = $derived.by(() => {
		if (!canvas) return null;
		return getComputedStyle(canvas);
	});

	let ctx: CanvasRenderingContext2D | null;
	let workCtx: CanvasRenderingContext2D | null;

	let imageIsLoaded: boolean = $state(false);
	let workCanvasPixelData: ImageData | null = null;

	const duckWidth: number = 184;
	const duckHeight: number = 127;

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
		if (!duckWidth || !duckHeight) return false;
		const canvasWidth = parseInt(canvasComputedStyle!.width.replace('px', ''));
		const canvasHeight = parseInt(canvasComputedStyle!.height.replace('px', ''));

		const centerX = x + Math.floor(duckWidth / 2);
		const centerY = y + Math.floor(duckHeight / 2);

		if (centerX < 0 || centerY < 0 || centerX >= canvasWidth || centerY >= canvasHeight) {
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

	const loadDucks = async (): Promise<void> => {
		const centerX: number = Math.floor(
			parseInt(canvasComputedStyle!.width.replaceAll('px', '')) / 2 - duckWidth / 2
		);
		const centerY: number = Math.floor(
			parseInt(canvasComputedStyle!.height.replaceAll('px', '')) / 2 - duckHeight / 2
		);

		for (let i: number = 0; i < userDucks.length; i++) {
			const duckElement: HTMLImageElement = duckElements[i];
			if (!duckElement) continue;

			let duckSpawnX: number;
			let duckSpawnY: number;
			let attempts = 0;
			const maxAttempts = 50;

			do {
				const angle = (i / userDucks.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
				const radius = minDuckDistance * 0.6 * (1 + i * 0.5) + Math.random() * 20;
				
				duckSpawnX = centerX + Math.cos(angle) * radius;
				duckSpawnY = centerY + Math.sin(angle) * radius;
				
				attempts++;
				
				if (attempts >= maxAttempts) break;
				
			} while (
				!isPositionValid(duckSpawnX, duckSpawnY) || 
				wouldCollideWithDucks(duckSpawnX, duckSpawnY, i)
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

			duckElement.style.left = `${duckSpawnX}px`;
			duckElement.style.top = `${duckSpawnY}px`;
		}
		
		raf = requestAnimationFrame(animateDucks);
	};

	const animateDucks = (): void => {
		for (let duckIndex = 0; duckIndex < userDucks.length; ++duckIndex) {
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
		loadPond();
		setTimeout(loadDucks, 10);
		return () => {
			cancelAnimationFrame(raf);
		};
	});
</script>

<main class="relative w-full h-full">
	<canvas class="absolute z-10" bind:this={canvas}></canvas>
	<canvas class="absolute z-0 hidden" bind:this={workCanvas}></canvas>
	{#each userDucks as duck, i}
		<img 
			src={idleGifPath}
			alt="duck"
			class="absolute z-20 rounded-100 overflow-hidden"
			style="width: {duckWidth}px; height: {duckWidth}px;"
			bind:this={duckElements[i]}
		/>
	{/each}
</main>