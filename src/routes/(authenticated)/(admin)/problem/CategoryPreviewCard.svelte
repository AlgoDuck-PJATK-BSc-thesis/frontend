<script lang='ts'>
	import type { StandardResponseDto } from "$lib/api/apiCall";
	import { drawGrid } from "../../(user)/home/refactor/gridUtils";
	import type { ObjectDims2d } from "../../(user)/home/refactor/PondTypes";
    import type { CategoryPreviewDto } from "./problemTypes";

    let { options }: { options: StandardResponseDto<CategoryPreviewDto> } = $props();

    let imageError: boolean = $state(false);
    let isLoading: boolean = $state(true);
    let gridDims: ObjectDims2d = $state({} as ObjectDims2d);

</script>

<div class="w-64 flex flex-col gap-3">
    <div class="flex items-center gap-3">
        <div class="w-14 h-14 rounded-lg overflow-hidden bg-admin-bg-secondary border border-admin-border-primary relative shrink-0">
            <canvas 
                {@attach node => {
                    $effect(() => {
                        drawGrid(node, 'rgba(255, 255, 255, 1)', 1, { width: 8, height: 8 });
                    })
                }} 
                bind:clientHeight={gridDims.height} 
                bind:clientWidth={gridDims.width} 
                width={gridDims.width} 
                height={gridDims.height} 
                class="absolute inset-0 opacity-[0.03] w-full h-full"
            ></canvas>

            {#if isLoading && !imageError}
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-4 h-4 border-2 border-admin-border-primary border-t-admin-text-secondary rounded-full animate-spin"></div>
                </div>
            {/if}

            {#if !imageError}
                <img src={`https://d3018wbyyxg1xc.cloudfront.net/category/${options.body.categoryId}/Sprite.png`} 
                    alt={options.body.categoryName}
                    class="absolute inset-0 w-full h-full object-contain p-1.5 transition-opacity duration-200"
                    class:opacity-0={isLoading}
                    class:opacity-100={!isLoading}
                    style="image-rendering: pixelated;"
                    onload={() => { imageError = false; isLoading = false; }}
                    onerror={() => { imageError = true; isLoading = false; }}
                />
            {:else}
                <div class="absolute inset-0 flex items-center justify-center text-admin-text-muted">
                    <span class="text-lg">?</span>
                </div>
            {/if}
        </div>

        <div class="flex flex-col min-w-0">
            <span class="text-sm font-medium text-admin-text-primary truncate">
                {options.body.categoryName}
            </span>
            <span class="text-xs text-admin-text-muted">
                {options.body.problemCount} {options.body.problemCount === 1 ? 'problem' : 'problems'}
            </span>
        </div>
    </div>
</div>