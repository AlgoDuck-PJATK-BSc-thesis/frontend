<script lang='ts'>
	import { GRID_COLUMNS, GRID_ROWS } from "../../../../(user)/home/refactor/constants";
	import { drawGrid, getRelativeCoordinates, HightlightCells2, loadImageToCanvas, pixelToGridCoords } from "../../../../(user)/home/refactor/gridUtils";
	import type { Coords, GridPoint, HighlightAction, ObjectDims2d, Rgba } from "../../../../(user)/home/refactor/PondTypes";
	import type { PlantData } from "../ItemCreationTypes";
	import ToolTip from "../../../problem/upsert/ToolTip.svelte";
	import ToggleButton from "./ToggleButton.svelte";

	let { itemData = $bindable(), sprite }: { itemData: PlantData, sprite?: File } = $props();
	const MAX_DIMENSION = 5;

	const highlightColor: Rgba = $derived({
		r: 0,
		g: 158,
		b: 96,
		a: sprite ? 0.1 : 0.5
	});

	let isReferencePondVisible: boolean = $state(false);


	const getPreviewUrl = (file: File | undefined): string | null => {
        return file ? URL.createObjectURL(file) : null;
    };

	let canvas: HTMLCanvasElement | undefined = $state();
	let backgroundCanvas: HTMLCanvasElement | undefined = $state();
	let backgroundCanvas2: HTMLCanvasElement | undefined = $state();
	let container: HTMLButtonElement | undefined = $state();
	let containerWidth = $state(0);

	let cellWidth = $derived(containerWidth / GRID_COLUMNS);
	let containerHeight = $derived(cellWidth * GRID_ROWS);
	let cellHeight = $derived(containerHeight / GRID_ROWS);

	let anchorPoint: GridPoint | undefined = $state();
	let currentPoint: GridPoint | undefined = $state();
	let canvasRect: DOMRect | undefined = $state();

	let spriteStartX: number | undefined = $derived.by(() => {
		if (!anchorPoint || !currentPoint) return;
		return Math.min(anchorPoint.col, currentPoint.col);
	});

	let spriteStartY: number | undefined = $derived.by(() => {
		if (!anchorPoint || !currentPoint) return;
		return Math.min(anchorPoint.row, currentPoint.row);
	});

	

	let lastWidth: number;
	let lastHeight: number;

	let isKeyboardMode = $state(false);

	$effect(() => {
		if (!container) return;

		const observer = new ResizeObserver((entries) => {
			containerWidth = entries[0].contentRect.width;
		});

		observer.observe(container);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!canvas || !containerWidth) return;
		redrawCanvas();
	});

	let hasInitialized = false;
	$effect(() => {
		if (!canvas || !containerWidth || hasInitialized) return;
		if (itemData.width && itemData.height && itemData.width > 0 && itemData.height > 0) {
			hasInitialized = true;
			const startCol = Math.floor(GRID_COLUMNS / 6) - Math.floor(itemData.width / 6);
			const startRow = Math.floor(GRID_ROWS / 6) - Math.floor(itemData.height / 6);
			
			anchorPoint = { col: startCol, row: startRow };
			currentPoint = { col: startCol + itemData.width - 1, row: startRow + itemData.height - 1 };
			
			highlightSelection(anchorPoint, currentPoint);
		}
	});

	$effect(() => {
		if (!backgroundCanvas || !containerWidth || !containerHeight || !backgroundCanvas2) return;
		
		if (isReferencePondVisible) {
			loadImageToCanvas(backgroundCanvas, "/src/lib/images/ponds/Homepage_dark.png");
			loadImageToCanvas(backgroundCanvas2, "/src/lib/images/ponds/Homepage_dark_trees.png");
		} else {
			const ctx = backgroundCanvas.getContext('2d');
			if (ctx) {
				ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
			}
		}
	});

	const redrawCanvas = () => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawGrid(canvas);
	};

	const handleMouseUp = () => {
		document.removeEventListener('mouseup', handleMouseUp);
		document.removeEventListener('mousemove', handleMouseMove);
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (!canvas) return;
		isKeyboardMode = false;

		currentPoint = undefined;
		anchorPoint = undefined;

		document.addEventListener('mouseup', handleMouseUp);
		document.addEventListener('mousemove', handleMouseMove);

		canvasRect = canvas.getBoundingClientRect();

		const relativeCoords: Coords = getRelativeCoordinates(e, canvas);
		const cellDims: ObjectDims2d = { width: cellWidth, height: cellWidth };
		const gridCoords: Coords = pixelToGridCoords(relativeCoords, cellDims);

		anchorPoint = {
			col: gridCoords.x,
			row: gridCoords.y
		};

		highlightSelection(anchorPoint, anchorPoint);

		lastWidth = 1;
		lastHeight = 1;

		itemData.width = lastWidth;
		itemData.height = lastHeight;
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!canvas || !anchorPoint || !canvasRect) return;

		const relativeCoords: Coords = {
			x: e.clientX - canvasRect.x,
			y: e.clientY - canvasRect.y
		};

		const cellDims: ObjectDims2d = { width: cellWidth, height: cellWidth };
		const currentGridCoords: Coords = pixelToGridCoords(relativeCoords, cellDims);

		currentPoint = clampToMaxDimension(anchorPoint, {
			col: currentGridCoords.x,
			row: currentGridCoords.y
		});

		const dx = currentPoint.col - anchorPoint.col;
		const dy = currentPoint.row - anchorPoint.row;

		const selectionWidth = Math.abs(dx) + 1;
		const selectionHeight = Math.abs(dy) + 1;

		let changedDimensions = false;

		if (lastWidth !== selectionWidth) {
			lastWidth = selectionWidth;
			itemData.width = selectionWidth;
			changedDimensions = true;
		}

		if (lastHeight !== selectionHeight) {
			lastHeight = selectionHeight;
			itemData.height = selectionHeight;
			changedDimensions = true;
		}

		if (!changedDimensions) return;

		highlightSelection(anchorPoint, currentPoint);
	};

	const clampToMaxDimension = (anchor: GridPoint, current: GridPoint): GridPoint => {
		let clampedCol = current.col;
		let clampedRow = current.row;

		const dx = current.col - anchor.col;
		const dy = current.row - anchor.row;

		if (Math.abs(dx) >= MAX_DIMENSION) {
			clampedCol = anchor.col + (MAX_DIMENSION - 1) * Math.sign(dx);
		}

		if (Math.abs(dy) >= MAX_DIMENSION) {
			clampedRow = anchor.row + (MAX_DIMENSION - 1) * Math.sign(dy);
		}

		return { col: clampedCol, row: clampedRow };
	};

	const highlightSelection = (anchor: GridPoint, current: GridPoint) => {
		if (!canvas) return;

		redrawCanvas();

		const startCol = Math.min(anchor.col, current.col);
		const endCol = Math.max(anchor.col, current.col);
		const startRow = Math.min(anchor.row, current.row);
		const endRow = Math.max(anchor.row, current.row);

		const cellsToHighlight: HighlightAction[] = [];

		for (let col = startCol; col <= endCol; ++col) {
			for (let row = startRow; row <= endRow; ++row) {
				cellsToHighlight.push({
					point: { col, row },
					color: highlightColor
				});
			}
		}

		HightlightCells2(canvas, ...cellsToHighlight);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (!canvas) return;

		if (e.key === 'Enter') {
			e.preventDefault();
			if (!isKeyboardMode) {
				anchorPoint = undefined;
				currentPoint = undefined;
				isKeyboardMode = true;
				anchorPoint = { col: Math.floor(GRID_COLUMNS / 2) - 1, row: Math.floor(GRID_ROWS / 2) };
				currentPoint = { col: Math.floor(GRID_COLUMNS / 2), row: Math.floor(GRID_ROWS / 2) };
				itemData.width = 1;
				itemData.height = 1;
				highlightSelection(anchorPoint, currentPoint);
			} else {
				isKeyboardMode = false;
			}
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			isKeyboardMode = false;
			anchorPoint = undefined;
			currentPoint = undefined;
			redrawCanvas();
			return;
		}

		if (!isKeyboardMode || !anchorPoint || !currentPoint) return;

		let newCol = currentPoint.col;
		let newRow = currentPoint.row;

		switch (e.key) {
			case 'ArrowUp':
			case 'w':
			case 'W':
				e.preventDefault();
				newRow = Math.max(0, currentPoint.row - 1);
				break;
			case 'ArrowDown':
			case 's':
			case 'S':
				e.preventDefault();
				newRow = Math.min(GRID_ROWS - 1, currentPoint.row + 1);
				break;
			case 'ArrowLeft':
			case 'a':
			case 'A':
				e.preventDefault();
				newCol = Math.max(0, currentPoint.col - 1);
				break;
			case 'ArrowRight':
			case 'd':
			case 'D':
				e.preventDefault();
				newCol = Math.min(GRID_COLUMNS - 1, currentPoint.col + 1);
				break;
			default:
				return;
		}

		let newPoint: GridPoint = { col: newCol, row: newRow };
		newPoint = clampToMaxDimension(anchorPoint, newPoint);

		currentPoint = newPoint;

		const width = Math.abs(currentPoint.col - anchorPoint.col) + 1;
		const height = Math.abs(currentPoint.row - anchorPoint.row) + 1;

		itemData.width = width;
		itemData.height = height;

		highlightSelection(anchorPoint, currentPoint);
	};

	const toggleReferencePond = () => {
		isReferencePondVisible = !isReferencePondVisible;
	}

</script>

<div class="bg-admin-bg-secondary border border-admin-border-primary rounded overflow-hidden gap-4">
	<div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary">
		<h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Plant Data</h3>
	</div>

	<div class="w-full flex flex-col py-2">
		<div class="flex flex-row px-4 items-center relative">
			<div class="flex flex-col gap-1 w-full relative">
				<div class="flex flex-row gap-2 w-full">
					<h3 class="text-xs font-semibold text-admin-text-primary tracking-wide">
						Plant dimensions
					</h3>
					<ToolTip options={{tip: "Click and drag to select plant dimensions (max 5x5).\nPress Enter to start keyboard mode,\nthen use Arrow keys or WASD to resize. Enter to confirm. \nThis has no effect on eventual positioning"}}/>
				</div>
				<p class="text-[10px] text-admin-text-secondary">
					Current size: {itemData.width ?? 1} x {itemData.height ?? 1} {isKeyboardMode ? '(keyboard mode)' : ''}
				</p>
			</div>
			<div class="absolute w-1/2 px-4 h-8 right-0 flex justify-end">	<!-- the 1/2 is rank btw -->
				<ToolTip options={{ 
					tip:'toggle preview of the pond, \nnear which the plants will be placed', 
					customIcon: {
						component: ToggleButton,
						options: { toggle: toggleReferencePond }
					}}}/>
			</div>
		</div>
		
		<div class="p-4">
			<button onmousedown={handleMouseDown} 
				onkeydown={handleKeyDown}
				bind:this={container} 
				class="w-full focus:outline-none relative focus:ring-2 focus:ring-[rgb(0,158,96, 0.2)] focus:ring-opacity-50 rounded"
				tabindex="0"
				aria-label="Plant dimension selector. Press Enter to start keyboard selection, use arrow keys or WASD to adjust size.">
				{#if isReferencePondVisible}
					<canvas 
						bind:this={backgroundCanvas}
						width={containerWidth}
						height={containerHeight}
						style:height="{containerHeight}px"
						class="w-full absolute inset-0 z-0">
					</canvas>
					<canvas 
						bind:this={backgroundCanvas2}
						width={containerWidth}
						height={containerHeight}
						style:height="{containerHeight}px"
						class="w-full absolute inset-0 z-100">
					</canvas>
				{/if}

				{#if sprite && itemData.width && itemData.height && spriteStartX && spriteStartY }
					<img class="absolute pointer-events-none select-none z-90" src="{getPreviewUrl(sprite)}" alt="{sprite.name}" style="left: {spriteStartX * cellWidth}px; top: {spriteStartY * cellHeight}px; width: {itemData.width * cellWidth}px; height: {itemData.height * cellHeight}px;">
				{/if}

				<canvas bind:this={canvas} width={containerWidth} height={containerHeight} style:height="{containerHeight}px" class="w-full relative z-20">
				</canvas>
			</button>
		</div>
	</div>
</div>