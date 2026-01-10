<script lang="ts">
    import { type StandardResponseDto } from "$lib/api/apiCall";
    import type { FullItemDetailsDto, PlantData } from "./ItemDetailsTypes";
    import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
    import SpriteViewer from "./SpriteViewer.svelte";
	import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";
	import PenIconSvg from "$lib/svg/EditorComponentIcons/PenIconSvg.svelte";
	import PlantDataDisplay from "./PlantDataDisplay.svelte";

    let { data }: { data: StandardResponseDto<FullItemDetailsDto> } = $props();

    const item = $derived(data.body);

    const getItemTypeLabel = (type: string): string => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    const getItemTypeBadgeClass = (type: string): string => {
        switch (type) {
            case 'duck':
                return 'bg-[#4fc1ff]/20 text-[#4fc1ff] border-[#4fc1ff]/30';
            case 'plant':
                return 'bg-[#89d185]/20 text-[#89d185] border-[#89d185]/30';
            default:
                return 'bg-admin-border-primary text-admin-text-muted border-admin-border-primary';
        }
    };
</script>

<main class="w-full min-h-screen bg-admin-bg-primary text-admin-text-secondary font-sans">
    <div class="max-w-4xl mx-auto p-6 flex flex-col gap-5">
        <div class="py-4 border-b border-admin-border-primary">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <a href="/items" class="p-1.5 rounded hover:bg-admin-border-primary transition-colors text-admin-text-muted hover:text-admin-text-secondary">
                        <ChevronIconSvg options={{ class: "w-5 h-5 stroke-[2] rotate-180 stroke-white" }} />
                    </a>
                    <div class="flex items-center gap-3">
                        <h2 class="text-2xl font-normal text-admin-text-primary tracking-tight">{item.itemName}</h2>
                        <span class="px-2.5 py-1 text-xs font-medium rounded-full border {getItemTypeBadgeClass(item.itemType)}">
                            {getItemTypeLabel(item.itemType)}
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <a href={`/items/create-item?itemId=${item.itemId}&edit=true`}
                        class="flex items-center gap-2 px-4 py-2 text-sm text-admin-text-secondary border border-admin-border-primary rounded hover:bg-admin-border-primary transition-colors">
                        <PenIconSvg options={{ class: 'w-4 h-4 stroke-[2] stroke-admin-text-secondary' }} />
                        <span>Edit</span>
                    </a>
                    <button class="flex items-center gap-2 px-4 py-2 text-sm text-admin-danger-text border border-admin-danger-bg/50 rounded hover:bg-admin-danger-bg/20 transition-colors">
                        <BinIconSvg options={{ class: 'w-4 h-4 stroke-[2] stroke-admin-danger-text' }} />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-admin-bg-secondary border border-admin-border-primary rounded overflow-hidden">
            <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary">
                <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Basic Information</h3>
            </div>
            <div class="p-4 flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                    <span class="text-xs text-admin-text-muted uppercase tracking-wider">Item ID</span>
                    <code class="px-2 py-1 bg-admin-bg-primary rounded text-sm text-[#ce9178] font-mono">{item.itemId}</code>
                </div>

                {#if item.itemDescription}
                    <div class="flex flex-col gap-1">
                        <span class="text-xs text-admin-text-muted uppercase tracking-wider">Description</span>
                        <p class="text-sm text-admin-text-secondary">{item.itemDescription}</p>
                    </div>
                {/if}

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div class="flex flex-col gap-1 p-3 bg-admin-bg-primary rounded border border-admin-border-primary">
                        <span class="text-xs text-admin-text-muted uppercase tracking-wider">Price</span>
                        <div class="flex items-center gap-2">
                            <img class="w-4 h-4" src="/src/lib/images/store/coin.png" alt="coin" />
                            <span class="text-lg font-medium text-admin-text-primary">{item.price}</span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1 p-3 bg-admin-bg-primary rounded border border-admin-border-primary">
                        <span class="text-xs text-admin-text-muted uppercase tracking-wider">Purchases</span>
                        <span class="text-lg font-medium text-admin-text-primary">{item.purchases}</span>
                    </div>

                    <div class="flex flex-col gap-1 p-3 bg-admin-bg-primary rounded border border-admin-border-primary">
                        <span class="text-xs text-admin-text-muted uppercase tracking-wider">Created On</span>
                        <span class="text-sm font-medium text-admin-text-primary">{item.createdOn}</span>
                    </div>

                    <div class="flex flex-col gap-1 p-3 bg-admin-bg-primary rounded border border-admin-border-primary">
                        <span class="text-xs text-admin-text-muted uppercase tracking-wider">Created By</span>
                        <code class="text-xs text-[#ce9178] font-mono truncate" title={item.createdBy}>{item.createdBy}</code>
                    </div>
                </div>
            </div>
        </div>

        {#if item.itemType === "plant"}
            <PlantDataDisplay itemData={item.itemTypeSpecificData as PlantData} />
        {/if}

        <SpriteViewer itemId={item.itemId} itemType={item.itemType} />

    </div>
</main>