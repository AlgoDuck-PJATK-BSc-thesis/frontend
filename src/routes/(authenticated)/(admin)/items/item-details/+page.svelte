<script lang="ts">
    import { type StandardResponseDto } from "$lib/api/apiCall";
    import type { FullItemDetailsDto, PlantData } from "./ItemDetailsTypes";
    import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";
    import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";
    import PenIconSvg from "$lib/svg/EditorComponentIcons/PenIconSvg.svelte";
    import PlantDataDisplay from "./PlantDataDisplay.svelte";
    import SpriteViewer from "./SpriteViewer.svelte";
	import ItemStatistics from "./ItemStatistics.svelte";

    let { data }: { data: StandardResponseDto<FullItemDetailsDto> } = $props();


    const Tabs = ['General', 'Statistics'] as const;
    type Tab = (typeof Tabs)[number];

    let currentTab: Tab = $state("General");

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

</script>

<main class="w-full min-h-screen bg-admin-bg-primary text-admin-text-secondary font-sans">
    <div class="max-w-6xl mx-auto p-6 flex flex-col gap-6">
        <header class="flex items-center justify-between py-2">
            <div class="flex items-center gap-4">
                <a href="/items" class="w-9 h-9 flex items-center justify-center rounded-lg bg-admin-bg-secondary border border-admin-border-primary hover:border-admin-text-muted/30 transition-all duration-200">
                    <ChevronIconSvgNew options={{ class: "w-4 h-4 stroke-[2] rotate-180 stroke-admin-text-muted" }} />
                </a>
                <div class="flex items-center gap-3">
                    <h1 class="text-xl font-medium text-admin-text-primary tracking-tight">{data.body.itemDetailsCore.itemName}</h1>
                    <span class="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border bg-admin-border-primary text-admin-text-muted border-admin-border-primary">
                        {data.body.itemDetailsCore.itemType}
                    </span>
                </div>
            </div>

            <div class="flex flex-row h-full items-center gap-1 bg-admin-border-primary rounded-full p-1">
                {#each Tabs as tab}
                    <button onclick={() => {
                        currentTab = tab
                    }} class="px-2 w-full py-1 rounded-full text-[10px] transition-all
                        {currentTab === tab ? 'bg-admin-accent-primary text-admin-text-secondary font-medium' : 'text-admin-text-muted hover:text-admin-text-secondary'}">
                        <span>{tab}</span>
                    </button>
                {/each}
            </div>

            <div class="flex items-center gap-3">
                    <a href={`/items/create-item?itemId=${data.body.itemDetailsCore.itemId}&edit=true`}
                        class="flex items-center gap-2 px-4 py-2 bg-admin-bg-secondary border border-admin-bg-input text-admin-text-secondary text-sm rounded-sm cursor-pointer transition-colors hover:bg-admin-bg-tertiary">
                        <PenIconSvg options={{ class: "w-4 h-4 stroke-current stroke-2" }}/>
                        <span>Edit Item</span>
                    </a>
                    <button onclick={() => /* isDeletionModalVisible = true */{}}
                        class="flex items-center gap-2 px-4 py-2 bg-admin-danger-bg text-admin-danger-text text-sm rounded-sm cursor-pointer transition-colors hover:bg-admin-danger-bg-hover">
                        <BinIconSvg options={{ class: "w-4 h-4 stroke-current stroke-2" }}/>
                        <span>Delete</span>
                    </button>
                </div>
        </header>
        {#if currentTab === "General"}
            <div class="grid grid-cols-2 gap-5">
                <SpriteViewer itemId={data.body.itemDetailsCore.itemId} itemType={data.body.itemDetailsCore.itemType} spriteList={data.body.spriteList} />

                <div class="flex flex-col gap-4">
                    <div class="bg-admin-bg-secondary border border-admin-border-primary rounded-xl p-4">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="flex-1">
                                <div class="text-[10px] uppercase tracking-wider text-admin-text-muted mb-1">Price</div>
                                <div class="flex items-center gap-1.5">
                                    <img class="w-5 h-5" src="/src/lib/images/store/coin.png" alt="coin" />
                                    <span class="text-2xl font-semibold text-admin-text-primary tabular-nums">{data.body.itemDetailsCore.price.toLocaleString()}</span>
                                </div>
                            </div>
                            <div class="w-px h-10 bg-admin-border-primary"></div>
                            <div class="flex-1">
                                <div class="text-[10px] uppercase tracking-wider text-admin-text-muted mb-1">Purchases</div>
                                <span class="text-2xl font-semibold text-admin-text-primary tabular-nums">{data.body.itemDetailsCore.purchases.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div class="pt-3 border-t border-admin-border-primary space-y-2.5">
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-admin-text-muted">Created</span>
                                <span class="text-xs text-admin-text-secondary">{formatDate(data.body.itemDetailsCore.createdOn)}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-admin-text-muted">Created by</span>
                                <code class="text-[11px] text-admin-text-muted font-mono bg-admin-bg-primary px-1.5 py-0.5 rounded">{data.body.itemDetailsCore.createdBy}</code>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-xs text-admin-text-muted">Item ID</span>
                                <code class="text-[11px] text-admin-text-muted font-mono bg-admin-bg-primary px-1.5 py-0.5 rounded">{data.body.itemDetailsCore.itemId}</code>
                            </div>
                        </div>
                    </div>

                    {#if data.body.itemDetailsCore.itemDescription}
                        <div class="bg-admin-bg-secondary border border-admin-border-primary rounded-xl p-4">
                            <div class="text-[10px] uppercase tracking-wider text-admin-text-muted mb-2">Description</div>
                            <p class="text-sm text-admin-text-secondary leading-relaxed">{data.body.itemDetailsCore.itemDescription}</p>
                        </div>
                    {/if}

                    {#if data.body.itemDetailsCore.itemType.toLocaleLowerCase() === "plant"}
                        <PlantDataDisplay itemData={data.body.itemTypeSpecificData as PlantData} compact={true} />
                    {/if}
                </div>
            </div>
        {:else}
            <ItemStatistics 
                itemId={data.body.itemDetailsCore.itemId}
                itemType={data.body.itemDetailsCore.itemType}
                itemSpecificStatistics={data.body.itemSpecificStatistics}
                timeseriesData={data.body.timeseriesData}
            />

        {/if}

    </div>
</main>