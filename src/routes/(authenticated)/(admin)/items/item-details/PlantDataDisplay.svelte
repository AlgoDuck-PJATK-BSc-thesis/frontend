<script lang="ts">
    import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
    import type { PlantData } from "./ItemDetailsTypes";

    let { itemData, compact = false }: { itemData: PlantData; compact?: boolean } = $props();
</script>

{#if compact}
    <div class="bg-admin-bg-secondary border border-admin-border-primary rounded-xl p-4">
        <div class="text-[10px] uppercase tracking-wider text-admin-text-muted mb-3">Plant Properties</div>
        <div class="flex items-center gap-3">
            <div class="flex-1 p-3 bg-admin-bg-primary rounded-lg border border-admin-border-primary text-center">
                <div class="text-lg font-semibold text-[#89d185] tabular-nums">{itemData.width}</div>
                <div class="text-[10px] text-admin-text-muted uppercase tracking-wider mt-0.5">Width</div>
            </div>
            <CrossIconSvg options={{ class: 'w-5 h-5 stroke-[2] stroke-admin-text-muted' }}/>
            <div class="flex-1 p-3 bg-admin-bg-primary rounded-lg border border-admin-border-primary text-center">
                <div class="text-lg font-semibold text-[#89d185] tabular-nums">{itemData.height}</div>
                <div class="text-[10px] text-admin-text-muted uppercase tracking-wider mt-0.5">Height</div>
            </div>
        </div>
        <div class="mt-3 p-2 bg-admin-bg-primary rounded-lg border border-admin-border-primary">
            <div 
                class="grid gap-0.5 mx-auto"
                style="grid-template-columns: repeat({itemData.width}, 1fr); max-width: {Math.min(itemData.width * 20, 100)}px;"
            >
                {#each Array(itemData.width * itemData.height) as _, i}
                    <div class="aspect-square bg-[#89d185]/20 rounded-sm border border-[#89d185]/30"></div>
                {/each}
            </div>
            <div class="text-[9px] text-admin-text-muted text-center mt-2">Grid footprint</div>
        </div>
    </div>
{:else}
    <div class="bg-admin-bg-secondary border border-admin-border-primary rounded-xl overflow-hidden">
        <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary">
            <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Plant Properties</h3>
        </div>
        <div class="p-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1 p-3 bg-admin-bg-primary rounded-lg border border-admin-border-primary">
                    <span class="text-xs text-admin-text-muted uppercase tracking-wider">Width</span>
                    <span class="text-xl font-semibold text-[#89d185]">{itemData.width} tiles</span>
                </div>
                <div class="flex flex-col gap-1 p-3 bg-admin-bg-primary rounded-lg border border-admin-border-primary">
                    <span class="text-xs text-admin-text-muted uppercase tracking-wider">Height</span>
                    <span class="text-xl font-semibold text-[#89d185]">{itemData.height} tiles</span>
                </div>
            </div>
        </div>
    </div>
{/if}