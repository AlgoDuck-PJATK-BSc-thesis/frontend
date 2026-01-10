<script lang="ts">
	import { onMount } from 'svelte';
	import { FetchFromApi } from '$lib/api/apiCall';
	import {
		drawGrid,
		highlightCells,
		getRelativeCoordinates,
		pixelToGridCoords,
		getPlantSubgrid,
		linearizeGridIndex as lineraizeGridIndex,
		initializeGridOccupancy,
		linearizeGridIndex,
	} from './gridUtils';
	import type { Coords, OwnedPlantDto, UsedPlantDto } from '$lib/Components/Misc/Pond/duckTypes';
	import { GRID_COLUMNS, GRID_ROWS } from './constants';
	import type { ObjectDims2d } from './PondTypes';
	import { toast } from '$lib/Components/Notifications/ToastStore.svelte';

	interface Props {
		placedPlants: UsedPlantDto[];
		containerDims: ObjectDims2d,
		workPondPath: string;
		mainElement: HTMLElement | null;
		onPlantPlaced?: (plant: UsedPlantDto) => void;
	}

	let {
		placedPlants = $bindable(),
		containerDims,
		workPondPath,
		mainElement,
		onPlantPlaced
	}: Props = $props();

	let gridCanvas: HTMLCanvasElement | undefined = $state();

	let workCanvas: HTMLCanvasElement | null = $state(null);
	let workCtx: CanvasRenderingContext2D | null = null;

	let isPointOnGridOccupied: boolean[] | undefined = $state();

	let draggedPlant: OwnedPlantDto | undefined = $state();
	let draggedPlantDims: ObjectDims2d | undefined = $derived(draggedPlant ? { 
		width: draggedPlant.width,
		height: draggedPlant.height
	} as ObjectDims2d : undefined)

	let dragPosition: Coords = $state({ x: 0, y: 0 });
	let isGridVisible: boolean = $state(false);

	let cellDims: ObjectDims2d = $derived({ width: containerDims.width / GRID_COLUMNS, height: containerDims.height / GRID_ROWS})

	const initWorkCanvas = async () => {
		if (!workCanvas || !containerDims) return;

		workCanvas.width = containerDims.width;
		workCanvas.height = containerDims.height;
		workCtx = workCanvas.getContext('2d', { willReadFrequently: true });

		if (!workCtx) return;

		const img = new Image();
		img.onload = () => {
			workCtx!.drawImage(img, 0, 0, containerDims.width, containerDims.height);
			initializeOccupancyData();
		};
		img.src = workPondPath;
	};

	const initializeOccupancyData = () => {
		if (!workCtx || !containerDims) return;
		if (isPointOnGridOccupied) return;

		isPointOnGridOccupied = initializeGridOccupancy(workCtx, containerDims);

		placedPlants.forEach((plant) => {
			togglePlantOccupied(plant);
		});
	};

	const togglePlantOccupied = (plant: UsedPlantDto) => {
		if (!isPointOnGridOccupied) return;

		for (let row = plant.gridY; row < plant.gridY + plant.height; ++row) {
			for (let col = plant.gridX; col < plant.gridX + plant.width; ++col) {
				if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLUMNS) {
					const gridIndex = lineraizeGridIndex({x: col, y: row});
					isPointOnGridOccupied[gridIndex] = !isPointOnGridOccupied[gridIndex];
				}
			}
		}
	};

	const isOccupied = (coord: Coords): boolean => {
		if (!isPointOnGridOccupied) return true;
		return isPointOnGridOccupied[lineraizeGridIndex(coord)] ?? true;
	};

	const updateGridHighlight = (coords: Coords[]) => {
		if (!gridCanvas || !mainElement) return;

		const mainRect = mainElement.getBoundingClientRect();
		gridCanvas.width = mainRect.width;
		gridCanvas.height = mainRect.height;

		drawGrid(gridCanvas);
		highlightCells(gridCanvas, coords, isOccupied);
	};

	export const startPlantDrag = (e: MouseEvent, plant: OwnedPlantDto) => {
		if (isPlantPlaced(plant.itemId)) return;

		draggedPlant = plant;
		dragPosition = { x: e.clientX, y: e.clientY };
		isGridVisible = true;

		document.addEventListener('mousemove', handlePlantDrag);
		document.addEventListener('mouseup', endPlantDrag);
	};

	let isRemoveMode: boolean = $state(false);

	const handlePlantDrag = (e: MouseEvent) => {
		if (!draggedPlantDims || !mainElement) return;

		dragPosition = { x: e.clientX, y: e.clientY };

		const relCoords = getRelativeCoordinates(e, mainElement);
		const gridCoords = pixelToGridCoords(relCoords, cellDims);
		const subgrid = getPlantSubgrid(gridCoords, draggedPlantDims);

		updateGridHighlight(subgrid);
	};

	const endPlantDrag = async (e: MouseEvent) => {
		if (!draggedPlantDims || !draggedPlant || !containerDims || !mainElement) {
			cleanupDrag();
			return;
		}

		const relCoords = getRelativeCoordinates(e, mainElement);
		const gridCoords = pixelToGridCoords(relCoords, cellDims);
		const plantSubgrid = getPlantSubgrid(gridCoords, draggedPlantDims);

		const illegalCells = plantSubgrid.filter(isOccupied);

		if (illegalCells.length !== 0) {
			cleanupDrag();
			return;
		}

		if (isPointOnGridOccupied) {
			plantSubgrid.forEach((c) => {
				const index = lineraizeGridIndex(c);
				isPointOnGridOccupied![index] = true;
			});
		}

		const res = await FetchFromApi('EmplacePlant', {
			method: 'PUT',
			body: JSON.stringify({
				itemId: draggedPlant.itemId,
				gridX: plantSubgrid[0].x,
				gridY: plantSubgrid[0].y
			})
		});

		if (res.status === 'Success') {
			const newPlant: UsedPlantDto = {
				gridX: plantSubgrid[0].x,
				gridY: plantSubgrid[0].y,
				width: draggedPlant.width,
				height: draggedPlant.height,
				itemId: draggedPlant.itemId
			};

			placedPlants.push(newPlant);
			onPlantPlaced?.(newPlant);
		}

		cleanupDrag();
	};

	const cleanupDrag = () => {
		draggedPlant = undefined;
		isGridVisible = false;
		document.removeEventListener('mousemove', handlePlantDrag);
		document.removeEventListener('mouseup', endPlantDrag);
	};

	export const isPlantPlaced = (plantItemId: string): boolean => {
		return placedPlants.some((p) => p.itemId === plantItemId);
	};

	export const getDraggedPlant = () => draggedPlant;
	export const getDragPosition = () => dragPosition;
	export const getIsGridVisible = () => isGridVisible;

	export const ToggleDeleteMode = () => {
		isRemoveMode = !isRemoveMode;
		isGridVisible = !isGridVisible;
		document.addEventListener('mousemove', handleDeleteMouseMove);
		document.addEventListener('mousedown', handleDeleteModeMouseClick);
		document.addEventListener('mouseup', cleanupPlantRemove);
	}

	const cleanupPlantRemove = () => {
		document.removeEventListener('mousemove', handleDeleteMouseMove);
		document.removeEventListener('mousedown', handleDeleteModeMouseClick);
		document.removeEventListener('mouseup', cleanupPlantRemove);
	}

	const handleDeleteMouseMove = (e: MouseEvent) => {
		if (!mainElement || !gridCanvas) return;
		drawGrid(gridCanvas);
		const occupyingPlant = getPlantPlacedHoveredOver(e);
		if (!occupyingPlant) return;
		const plantSubgrid = getPlantRemoveSubgrid(occupyingPlant);
		highlightCells(gridCanvas, ...[plantSubgrid], () => true);
	}

	const handleDeleteModeMouseClick = async (e: MouseEvent) => {
		if (!mainElement || !gridCanvas) return;
		drawGrid(gridCanvas);		
		try{
			const occupyingPlant = getPlantPlacedHoveredOver(e);
			if (!occupyingPlant) return;
			const result = await FetchFromApi("RemovePlant", {
				method: "DELETE"
			}, fetch, new URLSearchParams({ plantId: occupyingPlant.itemId }))
			if (result.status === "Success"){
				placedPlants.splice(placedPlants.findIndex(plant => plant.itemId == occupyingPlant.itemId), 1)
				getPlantRemoveSubgrid(occupyingPlant).map(se => linearizeGridIndex(se)).forEach(index => {
					if (isPointOnGridOccupied?.at(index)){
						isPointOnGridOccupied[index] = false;
					}
				});
			}else if(result.message){
				toast.error(result.message);
			}
		}catch (err){
			toast.error(err?.toString() ?? "");
		}finally{
			isGridVisible = false;
			isRemoveMode = false;
		}
	}

	const getPlantPlacedHoveredOver = (e: MouseEvent) : UsedPlantDto | undefined => {
		if (!mainElement || !gridCanvas) return;
		const relCoords = getRelativeCoordinates(e, mainElement);
		const gridCoords = pixelToGridCoords(relCoords, cellDims);

		let occupyingPlant: UsedPlantDto | undefined;
		if (isOccupied(gridCoords)){
			occupyingPlant = placedPlants.find((pp) => 
				gridCoords.x >= pp.gridX && 
				gridCoords.x < pp.gridX + pp.width && 
				gridCoords.y >= pp.gridY && 
				gridCoords.y < pp.gridY + pp.height
			)		
		}
		return occupyingPlant;
	}

	const getPlantRemoveSubgrid = (plant: UsedPlantDto) : Coords[] => {
		const coords: Coords[] = [];
		for (let col = 0; col < plant.width; ++col){
			for (let row = 0; row < plant.height; ++row){
				coords.push({x: plant.gridX + col, y: plant.gridY + row})
			}
		}
		return coords;
	}

	export const hideGrid = () => {
		isGridVisible = false;
	};

	export const showGrid = () => {
		isGridVisible = true;
	};

	$effect(() => {
		if (workPondPath && workCanvas && containerDims) {
			isPointOnGridOccupied = undefined;
			initWorkCanvas();
		}
	});

	onMount(() => {
		initWorkCanvas();

		return () => {
			document.removeEventListener('mousemove', handlePlantDrag);
			document.removeEventListener('mouseup', endPlantDrag);
		};
	});
</script>

<canvas width="{containerDims.width}" height="{containerDims.height}" bind:this={workCanvas} class="absolute z-0 hidden"></canvas>

{#each placedPlants as placedPlant}
	<div
		class="absolute z-20 flex flex-col items-center justify-center"
		style="width: {placedPlant.width * cellDims.width}px; 
			height: {placedPlant.height * cellDims.height}px; 
			left: {placedPlant.gridX * cellDims.width}px; 
			top: {placedPlant.gridY * cellDims.height}px;"
	>
		<img src={`https://d3018wbyyxg1xc.cloudfront.net/Plants/${placedPlant.itemId}.png`}
			alt="plant"
			class="h-full w-full object-contain"
		/>
	</div>
{/each}

{#if isGridVisible}
	<canvas width="{containerDims.width}" height="{containerDims.height}" bind:this={gridCanvas} class="absolute z-901 {isRemoveMode ? "cursor-[url('/shovel.png'),_auto]" : "cursor-default"}" use:drawGrid></canvas>
{/if}

{#if draggedPlant && draggedPlantDims}
	<div class="pointer-events-none fixed z-[1000]" style="width: {draggedPlantDims.width}px; height: {draggedPlantDims.height}px; left: {dragPosition.x}px; top: {dragPosition.y}px; transform: translate(-50%, -50%);">
		<img src={`https://d3018wbyyxg1xc.cloudfront.net/Plants/${draggedPlant.itemId}.png`} alt="dragging plant" class="opacity-80"/>
	</div>
{/if}
