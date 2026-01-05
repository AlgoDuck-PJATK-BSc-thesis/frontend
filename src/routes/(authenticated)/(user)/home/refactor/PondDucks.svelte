<script lang="ts">
	import { onMount } from 'svelte';
	import { loadImageToCanvas } from './gridUtils';
	import type { UsedDuckDto } from '$lib/Components/Misc/Pond/duckTypes';
	import { DUCK_HEIGHT, DUCK_WIDTH } from './constants';
	import type { Coords, DuckAnimationContext, DuckPositionalData, ObjectDims2d } from './PondTypes';
	import { calculateSpawnPosition, createDuckPositionalData, IDLE_GIF_PATH, scaleDuckPositions, updateDuckAnimation } from './duckLogic';

	interface Props {
		ducks: UsedDuckDto[];
		containerDims: ObjectDims2d,
		workPondPath: string;
		onDuckAdded?: (itemId: string) => void;
	}

	let { ducks, containerDims, workPondPath, onDuckAdded }: Props = $props();

	let workCanvas: HTMLCanvasElement | null = $state(null);
	let pixelData: ImageData | null = $state(null);

	const duckElementsKeyed: Record<string, HTMLImageElement> = $state({});
	let duckPositionalDataKeyed: Record<string, DuckPositionalData> = $state({});

	let raf: number;
	let prevWidth = 0;
	let prevHeight = 0;
	let isInitialized = false;

	const getAnimationContext = (): DuckAnimationContext | null => {
		if (!pixelData || !containerDims) return null;
		return {
			pixelData,
			canvasDims: containerDims,
			duckPositionsKeyed: duckPositionalDataKeyed
		};
	};

	const loadWorkCanvas = async () => {
		if (!workCanvas || !containerDims) return;

		workCanvas.width = containerDims.width;
		workCanvas.height = containerDims.height;

		pixelData = await loadImageToCanvas(workCanvas, workPondPath, true);
	};

	const spawnDuck = (duck: UsedDuckDto) => {
		const ctx = getAnimationContext();
		if (!ctx || !containerDims) return;

		const canvasCenter: Coords = {
			x: containerDims.width / 2 - DUCK_WIDTH / 2,
			y: containerDims.height / 2 - DUCK_HEIGHT / 2
		}

		const spawnPos = calculateSpawnPosition(duck.itemId, canvasCenter, ctx);
		if (!spawnPos) return;
		const positionalData = createDuckPositionalData(spawnPos.x, spawnPos.y);
		duckPositionalDataKeyed[duck.itemId] = positionalData; 

		const duckElement: HTMLElement | undefined = duckElementsKeyed[duck.itemId];
		if (duckElement) {
			duckElement.style.left = `${spawnPos.x}px`;
			duckElement.style.top = `${spawnPos.y}px`;
		}

		onDuckAdded?.(duck.itemId);
	};

	const loadDucks = () => {
		ducks.forEach((duck) => spawnDuck(duck));
		raf = requestAnimationFrame(animateDucks);
	};

	const animateDucks = () => {
		const ctx = getAnimationContext();
		if (!ctx) {
			raf = requestAnimationFrame(animateDucks);
			return;
		}

		for (const [duckId, duck] of Object.entries(duckPositionalDataKeyed)){
			const duckElement: HTMLImageElement | undefined = duckElementsKeyed[duckId];
			if (!duckElement) continue;

			const result = updateDuckAnimation(duck, duckId, ctx);

			if (result.gifChanged && result.newGifPath) {
				duckElement.src = result.newGifPath;
			}

			duckElement.style.left = `${result.visualCoords.x}px`;
			duckElement.style.top = `${result.visualCoords.y}px`;
			duckElement.style.transform = result.flipX ? 'scaleX(-1)' : 'scaleX(1)';
		}

		raf = requestAnimationFrame(animateDucks);
	};

	const handleResize = async () => {
		if (!workCanvas || !containerDims ) return;

		const newWidth: number = containerDims.width;
		const newHeight: number = containerDims.height;

		if (newWidth === prevWidth && newHeight === prevHeight) return;

		const scaleX = prevWidth > 0 ? newWidth / prevWidth : 1;
		const scaleY = prevHeight > 0 ? newHeight / prevHeight : 1;

		workCanvas.width = newWidth;
		workCanvas.height = newHeight;

		pixelData = await loadImageToCanvas(workCanvas, workPondPath, true);

		const ctx = getAnimationContext();
		if (ctx) {
			scaleDuckPositions(duckPositionalDataKeyed, scaleX, scaleY, containerDims, ctx);

			for (const [itemId, duck] of Object.entries(duckPositionalDataKeyed)){
				const element: HTMLElement | undefined = duckElementsKeyed[itemId];
				if (!element) continue;
				element.style.left = `${duck.currentCoords.x}px`;
				element.style.top = `${duck.currentCoords.y}px`;
			}
		}

		prevWidth = newWidth;
		prevHeight = newHeight;
	};

	$effect(() => {
		if (containerDims && isInitialized) {
			handleResize();
		}
	});

	$effect(() => {
		if (workPondPath && workCanvas) {
			loadWorkCanvas();
		}
	});

	export const addDuck = (duck: UsedDuckDto) => spawnDuck(duck);


	export const removeDuck = (itemId: string) => duckPositionalDataKeyed = Object.fromEntries(Object.entries(duckPositionalDataKeyed).filter(([k, v]) => k !== itemId))


	onMount(() => {
		setTimeout(async () => {
			prevWidth = containerDims.width;
			prevHeight = containerDims.height;
	
			await loadWorkCanvas();

			setTimeout(() => {
				isInitialized = true;
				loadDucks();
			}, 50);
		})

		return () => {
			cancelAnimationFrame(raf);
		};
	});
</script>

<canvas bind:this={workCanvas} class="absolute z-0 hidden"></canvas>

{#each ducks as duck}
	<img src={IDLE_GIF_PATH} alt={duck.itemId} class="rounded-100 absolute z-20 overflow-hidden" style="height: {DUCK_HEIGHT}px;" bind:this={duckElementsKeyed[duck.itemId]}/>
{/each}
