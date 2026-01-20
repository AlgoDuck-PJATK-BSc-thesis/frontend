<script lang="ts">
    import ImageIconScg from "$lib/svg/EditorComponentIcons/ImageIconScg.svelte";
	import { drawGrid } from "../../../(user)/home/refactor/gridUtils";
	import type { ObjectDims2d } from "../../../(user)/home/refactor/PondTypes";
    import type { ItemType } from "./ItemDetailsTypes";

    let { itemId, itemType, spriteList }: { itemId: string; itemType: ItemType; spriteList: string[] } = $props();

    let activeSprite: string = $state(spriteList[0] ?? "");
    let imageError: boolean = $state(false);
    let isLoading: boolean = $state(true);

    const getSpriteUrl = (key: string): string => {
        return `https://d3018wbyyxg1xc.cloudfront.net/${itemType.toLowerCase()}/${itemId}/${key}`;
    };

    let activeUrl = $derived(getSpriteUrl(activeSprite));

    const handleImageError = () => {
        imageError = true;
        isLoading = false;
    };

    const handleImageLoad = () => {
        imageError = false;
        isLoading = false;
    };

    $effect(() => {
        activeSprite;
        imageError = false;
        isLoading = true;
    });
    let grid1Dims: ObjectDims2d = $state({} as ObjectDims2d);
    let grid2Dims: ObjectDims2d = $state({} as ObjectDims2d);
</script>

<div class="bg-admin-bg-secondary border border-admin-border-primary rounded-xl overflow-hidden flex flex-col">
    <div class="aspect-square w-full bg-admin-bg-primary relative overflow-hidden">
        <canvas {@attach node => {
            $effect(()=>{
                drawGrid(node, 'rgba(55, 65, 81, 0.5)', 1, {width: 20, height: 20});
            })
        }} bind:clientHeight={grid1Dims.height} bind:clientWidth={grid1Dims.width} width={grid1Dims.width} height={grid1Dims.height} class="absolute inset-0 opacity-[0.03] w-full h-full"
        ></canvas>
        <canvas {@attach node => {
            $effect(()=>{
                drawGrid(node, 'rgba(255, 00, 00, 1)', 3, {width: 2, height: 2});
            })
        }} bind:clientHeight={grid2Dims.height} bind:clientWidth={grid2Dims.width} width={grid2Dims.width} height={grid2Dims.height} class="absolute inset-0 opacity-[0.03] w-full h-full"
        ></canvas>
        <div class="absolute inset-0 max-w-3xl flex items-center justify-center p-12">
            {#if isLoading && !imageError}
                <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-8 h-8 border-2 border-admin-border-primary border-t-admin-accent-primary rounded-full animate-spin"></div>
                </div>
            {/if}
            
            {#if !imageError}
                <img src={activeUrl} alt={activeSprite} class="max-w-full max-h-full object-contain transition-opacity duration-300 drop-shadow-2xl"
                    class:opacity-0={isLoading}
                    class:opacity-100={!isLoading}
                    onerror={handleImageError}
                    onload={handleImageLoad}
                    style="image-rendering: pixelated;"
                />
            {:else}
                <div class="flex flex-col items-center gap-3 text-admin-text-muted">
                    <div class="w-16 h-16 rounded-2xl bg-admin-bg-secondary border border-admin-border-primary flex items-center justify-center">
                        <ImageIconScg options={{ class: 'w-8 h-8 stroke-[1.5] stroke-current' }} />
                    </div>
                    <span class="text-sm">Failed to load sprite</span>
                </div>
            {/if}
        </div>

        <div class="absolute top-4 left-4">
            <div class="px-3 py-1.5 bg-admin-bg-secondary/90 backdrop-blur-sm border border-admin-border-primary rounded-lg">
                <span class="text-xs font-medium text-admin-text-primary">{activeSprite}</span>
            </div>
        </div>

        <div class="absolute top-4 right-4">
            <div class="px-3 py-1.5 bg-admin-bg-secondary/90 backdrop-blur-sm border border-admin-border-primary rounded-lg">
                <span class="text-xs text-admin-text-muted">{spriteList.indexOf(activeSprite) + 1} / {spriteList.length}</span>
            </div>
        </div>
    </div>

    {#if spriteList.length > 1}
        <div class="px-4 py-3 bg-admin-bg-tertiary border-t border-admin-border-primary">
            <div class="flex items-center gap-2 overflow-x-auto scrollbar-thin">
                {#each spriteList as sprite}
                    <button onclick={() => activeSprite = sprite}
                        class="group relative flex-shrink-0 w-14 h-14 rounded-lg border-2 transition-all duration-200 overflow-hidden
                            {activeSprite === sprite 
                                ? 'border-admin-accent-primary bg-admin-accent-primary/10' 
                                : 'border-admin-border-primary bg-admin-bg-primary hover:border-admin-text-muted/40'}">
                        <img src={getSpriteUrl(sprite)} alt={sprite} class="w-full h-full object-contain p-1.5"/>
                        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="block text-[9px] text-white text-center py-1 truncate px-1">{sprite}</span>
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>

