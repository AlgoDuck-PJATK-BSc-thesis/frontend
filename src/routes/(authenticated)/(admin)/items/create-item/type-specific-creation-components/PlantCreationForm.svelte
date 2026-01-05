<script lang='ts'>
	import { GRID_COLUMNS, GRID_ROWS } from "../../../../(user)/home/refactor/constants";
	import { drawGrid, getRelativeCoordinates, HightlightCells2, pixelToGridCoords } from "../../../../(user)/home/refactor/gridUtils";
	import type { Coords, GridPoint, HighlightAction, ObjectDims2d, Rgba } from "../../../../(user)/home/refactor/PondTypes";
	import type { PlantData } from "../ItemCreationTypes";

	let { itemData = $bindable() }: { itemData: PlantData } = $props();

	const highlightColor: Rgba = {
		r: 0,
		g: 255,
		b: 0,
		a: 255
	};

	let canvas: HTMLCanvasElement | undefined = $state();
	let container: HTMLDivElement | undefined = $state();
	let containerWidth = $state(0);

	let cellWidth = $derived(containerWidth / GRID_COLUMNS);
	let containerHeight = $derived(cellWidth * GRID_ROWS);

	let anchorPoint: GridPoint | undefined = $state();
	let canvasRect: DOMRect | undefined = $state();

	let lastWidth: number;
	let lastHeight: number;

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
		drawGrid(canvas, '#ff0000', 1);
	});

	const handleMouseUp = () => {
		document.removeEventListener('mouseup', handleMouseUp);
		document.removeEventListener('mousemove', handleMouseMove);
		anchorPoint = undefined;
		canvasRect = undefined;
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (!canvas) return;
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

		const currentPoint: GridPoint = {
			col: currentGridCoords.x,
			row: currentGridCoords.y
		};

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

	const highlightSelection = (anchor: GridPoint, current: GridPoint) => {
		if (!canvas) return;

		drawGrid(canvas, '#ff0000', 1);

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
</script>

<div class="bg-admin-bg-secondary border border-admin-border-primary rounded overflow-hidden">
	<div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary">
		<h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Plant Data</h3>
	</div>
	<div class="p-4">
		<div onmousedown={handleMouseDown} bind:this={container} class="w-full">
			<canvas
				bind:this={canvas}
				width={containerWidth}
				height={containerHeight}
				style:height="{containerHeight}px"
				class="w-full"
			></canvas>
		</div>
	</div>
</div>