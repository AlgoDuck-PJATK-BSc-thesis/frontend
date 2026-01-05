<script lang="ts">
    import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
    import { ItemTypes, type DuckData, type ItemCreateDto, type ItemCreateResponseDto, type ItemType, type PlantData, type RarityDto, type SpriteSlot } from "./ItemCreationTypes";
    import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
    import SpriteUploader from "./SpriteUploader.svelte";
	import PlantCreationForm from "./type-specific-creation-components/PlantCreationForm.svelte";
	import ItemCreationResult from "./ItemCreationResult.svelte";
	import SpinnerIconSvg from "$lib/svg/EditorComponentIcons/SpinnerIconSvg.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";

    let { data }: { data: StandardResponseDto<RarityDto[]> } = $props(); 

    let formContents: ItemCreateDto = $state({
        itemData: {
            "$type": "duck",
        } as DuckData
    } as ItemCreateDto);

    let isSubmitting: boolean = $state(false);
    let submitError: string | undefined = $state();
    let submitResult: ItemCreateResponseDto | undefined = $state();

    const spriteSlotConfigs: Record<ItemType, SpriteSlot[]> = {
        duck: [
            { 
                key: "sprite",
                label: "Sprite",
                description: "Default appearance. Format: .png", 
                accept: "image/png" 
            },
            { 
                key: "idle", 
                label: "Idle", 
                description: "Floating. Format: .gif", 
                accept: "image/gif"
            },
            { 
                key: "swimming", 
                label: "Swimming", 
                description: "Moving. Format: .gif", 
                accept: "image/gif" 
            }
        ],
        plant: [
            { 
                key: "day", 
                label: "Day", 
                description: "Daytime appearance. Format: .png", 
                accept: "image/png" 
            },
            { 
                key: "night", 
                label: "Night", 
                description: "NightTime appearance. Format: .png", 
                accept: "image/png" 
            }
        ]
    };

    let spriteSlots: SpriteSlot[] = $state(
        spriteSlotConfigs.duck.map(s => ({ ...s }))
    );

    $effect(() => {
        spriteSlots = spriteSlotConfigs[formContents.itemData.$type].map(s => ({ ...s, file: undefined }));
    });

    let allSpritesUploaded = $derived(spriteSlots.every(s => s.file));

    const createItem = async () => {
        if (!allSpritesUploaded) return;
        
        isSubmitting = true;
        submitError = undefined;

        const formData: FormData = new FormData();
        Object.entries(formContents).forEach(([k, v]) => {
            if ((typeof v === "object" || Array.isArray(v)) && v !== null) {
                formData.append(k, JSON.stringify(v));
            } else {
                formData.append(k, v.toString());
            }
        });


        spriteSlots.filter(slot => slot.file).forEach(slot => {
            const file: File = slot.file!
            const extension = file.name.split('.').pop();
            formData.append('sprites', new File([file], `${slot.key}.${extension}`, {
                type: file.type 
            }));
        })

        FetchFromApi<ItemCreateResponseDto>("CreateItem", {
            method: "POST",
            body: formData
        }).then((value: StandardResponseDto<ItemCreateResponseDto>) => {
            submitResult = value.body;
        }).catch((err) => {
            submitError = err.message ?? "Failed to create item";
        }).finally(() => {
            isSubmitting = false;
        });
    };

    const resetForm = () => {
        formContents = { itemData: { "$type": "duck" } as DuckData } as ItemCreateDto;
        spriteSlots = spriteSlotConfigs.duck.map(s => ({ ...s, file: undefined }));
        submitResult = undefined;
        submitError = undefined;
    };
</script>

<main class="w-full min-h-screen bg-admin-bg-primary text-admin-text-secondary font-sans">
    <div class="max-w-4xl mx-auto p-6 flex flex-col gap-5">
        <div class="py-4 border-b border-admin-border-primary">
            <div class="flex items-center gap-3">
                <a href="/items" class="p-1.5 rounded hover:bg-admin-border-primary transition-colors text-admin-text-muted hover:text-admin-text-secondary">
                    <ChevronIconSvg options={{ class: "w-5 h-5 stroke-[2] rotate-180 stroke-white" }}/>
                </a>
                <h2 class="text-2xl font-normal text-admin-text-primary tracking-tight">Create Item</h2>
            </div>
        </div>

        {#if submitResult}
            <ItemCreationResult {submitResult} {resetForm}/>
        {:else}
            {#if submitError}
                <div class="flex items-center gap-3 p-4 bg-admin-danger-bg/20 border border-admin-danger-bg/50 rounded">
                    <svg class="w-5 h-5 text-admin-danger-text flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span class="text-sm text-admin-danger-text">{submitError}</span>
                </div>
            {/if}

            <div class="bg-admin-bg-secondary border border-admin-border-primary rounded overflow-hidden">
                <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary justify-between border-b border-admin-border-primary">
                    <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Basic Information</h3>
                        <div class="flex flex-row items-center gap-1 bg-admin-border-primary rounded-full p-1">

                        {#each ItemTypes as itemType}
                            <button onclick={() => {
                                formContents.itemData.$type = itemType
                            }} class="px-3 py-1 rounded-full text-xs transition-all
                                {formContents.itemData.$type === itemType ? 'bg-admin-accent-primary text-white font-medium' : 'text-admin-text-muted hover:text-admin-text-secondary'}">
                                <span>{itemType}</span>
                            </button>
                        {/each}
                    </div>
                </div>
                <div class="p-4 flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-admin-text-secondary">
                            Name <span class="text-admin-danger-text">*</span>
                        </span>
                        <input type="text" bind:value={formContents.itemName} maxlength={128} placeholder="Enter item name"
                            class="w-full px-3 py-2 bg-admin-border-primary border border-admin-border-primary rounded text-sm text-admin-text-secondary placeholder-admin-text-muted outline-none transition-colors focus:border-[#007fd4]"/>
                        <span class="text-xs text-admin-text-muted text-right">{formContents.itemName?.length ?? 0}/128</span>
                    </div>

                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-admin-text-secondary">Description</span>
                        <textarea bind:value={formContents.description} maxlength={128} rows={3} placeholder="Optional description"
                            class="w-full px-3 py-2 bg-admin-border-primary border border-admin-border-primary rounded text-sm text-admin-text-secondary placeholder-admin-text-muted outline-none transition-colors focus:border-[#007fd4] resize-none"
                        ></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <span class="text-sm text-admin-text-secondary">
                                Cost <span class="text-admin-danger-text">*</span>
                            </span>
                            <div class="relative flex items-center">
                                <img class="w-4 h-4 left-3 absolute" src="/src/lib/images/store/coin.png" alt="coin" />
                                <input type="number" bind:value={formContents.itemCost} min={0}
                                    class="w-full pl-9 pr-3 py-2 bg-admin-border-primary border border-admin-border-primary rounded text-sm text-admin-text-secondary outline-none transition-colors focus:border-[#007fd4]"/>
                            </div>
                        </div>

                        <div class="flex flex-col gap-2">
                            <span class="text-sm text-admin-text-secondary">
                                Rarity <span class="text-admin-danger-text">*</span>
                            </span>
                            <select bind:value={formContents.rarityId}
                                class="w-full px-3 py-2 bg-admin-border-primary border border-admin-border-primary rounded text-sm text-admin-text-secondary outline-none transition-colors focus:border-[#007fd4] cursor-pointer">
                                {#each data.body as rarity}
                                    <option value={rarity.rarityId}>{rarity.name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {#if formContents.itemData.$type === "plant"}
                <PlantCreationForm bind:itemData={ formContents.itemData as PlantData }/>
            {/if}

            <SpriteUploader bind:slots={spriteSlots} />

            <div class="flex items-center justify-end gap-3 pt-2">
                <a href="/items"
                    class="px-5 py-2.5 text-sm text-admin-text-secondary border border-admin-border-primary rounded hover:bg-admin-border-primary transition-colors">
                    Cancel
                </a>
                <button onclick={createItem} disabled={isSubmitting || !allSpritesUploaded}
                    class="px-5 py-2.5 text-sm font-medium rounded transition-colors flex items-center gap-2
                           {!isSubmitting && allSpritesUploaded
                               ? 'bg-admin-accent-primary text-white hover:bg-admin-accent-primary-hover cursor-pointer'
                               : 'bg-admin-border-primary text-admin-text-muted cursor-not-allowed'}">
                    {#if isSubmitting}
                        <SpinnerIconSvg/>
                        <span>Creating...</span>
                    {:else}
                        <CrossIconSvg options={{ class: 'w-4 h-4 stroke-[2] text-admin-text-secondary' }}/>
                        <span>Create Item</span>
                    {/if}
                </button>
            </div>
        {/if}
    </div>
</main>