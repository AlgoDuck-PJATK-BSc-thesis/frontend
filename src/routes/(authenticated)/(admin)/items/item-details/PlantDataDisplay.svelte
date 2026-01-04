<script lang="ts">
	import { GRID_COLUMNS, GRID_ROWS } from "../../../(user)/home/refactor/constants";
	import type { PlantData } from "./ItemDetailsTypes";

    let { itemData }: { itemData: PlantData } = $props();

    let canvas: HTMLCanvasElement | undefined = $state();
    let container: HTMLDivElement | undefined = $state();
    let containerWidth = $state(0);

    let cellWidth = $derived(containerWidth / GRID_COLUMNS);
    let containerHeight = $derived(cellWidth * GRID_ROWS);

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
        drawGrid(canvas);
    });

    const drawGrid = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;

        for (let col = 0; col <= GRID_COLUMNS; col++) {
            const x = col * cellWidth;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, containerHeight);
        }

        for (let row = 0; row <= GRID_ROWS; row++) {
            const y = row * cellWidth;
            ctx.moveTo(0, y);
            ctx.lineTo(containerWidth, y);
        }

        ctx.stroke();

        if (itemData.width && itemData.height) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            for (let col = 0; col < itemData.width && col < GRID_COLUMNS; col++) {
                for (let row = 0; row < itemData.height && row < GRID_ROWS; row++) {
                    ctx.fillRect(col * cellWidth, row * cellWidth, cellWidth, cellWidth);
                }
            }
        }
    };
</script>

<div class="bg-admin-bg-secondary border border-admin-border-primary rounded overflow-hidden">
    <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary">
        <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Plant Data</h3>
    </div>
    <div class="p-4 flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
                <span class="text-xs text-admin-text-muted uppercase tracking-wider">Width</span>
                <span class="text-lg font-medium text-admin-text-primary">{itemData.width} cells</span>
            </div>
            <div class="flex flex-col gap-1">
                <span class="text-xs text-admin-text-muted uppercase tracking-wider">Height</span>
                <span class="text-lg font-medium text-admin-text-primary">{itemData.height} cells</span>
            </div>
        </div>
        <div bind:this={container} class="w-full">
            <canvas
                bind:this={canvas}
                width={containerWidth}
                height={containerHeight}
                style:height="{containerHeight}px"
                class="w-full rounded"
            ></canvas>
        </div>
    </div>
</div>