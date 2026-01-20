<script lang="ts">
    import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
    import { ItemTypes, type DuckData, type ItemCreateDto, type ItemCreateResponseDto, type ItemCreationPageArgs, type ItemType, type PlantData, type RarityDto, type SpriteSlot } from "./ItemCreationTypes";
    import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
    import SpriteUploader from "./SpriteUploader.svelte";
	import PlantCreationForm from "./type-specific-creation-components/PlantCreationForm.svelte";
	import ItemCreationResult from "./ItemCreationResult.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import { onMount } from "svelte";
	import { useQueryClient } from "@tanstack/svelte-query";
	import { Tooltip } from "chart.js";
	import ToolTip from "../../problem/upsert/ToolTip.svelte";
	import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";
	import { toast } from "$lib/Components/Notifications/ToastStore.svelte";

    let { data }: { data: ItemCreationPageArgs } = $props(); 

    let formContents: ItemCreateDto = $state(data.itemData ?? {
        itemData: {
            "$type": "duck",
        } as DuckData
    } as ItemCreateDto);

    let isSubmitting: boolean = $state(false);
    let submitError: string | undefined = $state();
    let submitResult: ItemCreateResponseDto | undefined = $state();
    let isEditMode: boolean = $derived(data.isEditMode && data.itemData !== undefined)

    const spriteSlotConfigs: Record<ItemType, SpriteSlot[]> = {
        duck: [
            { 
                key: "Sprite.png",
                label: "Sprite",
                description: "Default appearance. Format: .png", 
                accept: "image/png" 
            },
            { 
                key: "Idle.gif", 
                label: "Idle", 
                description: "Floating. Format: .gif", 
                accept: "image/gif"
            },
            { 
                key: "Swimming.gif", 
                label: "Swimming", 
                description: "Moving. Format: .gif", 
                accept: "image/gif" 
            }
        ],
        plant: [
            { 
                key: "Day.png", 
                label: "Day", 
                description: "Daytime appearance. Format: .png", 
                accept: "image/png" 
            },
            { 
                key: "Night.png", 
                label: "Night", 
                description: "NightTime appearance. Format: .png", 
                accept: "image/png" 
            }
        ]
    };

    let spriteSlots: SpriteSlot[] = $state(
        spriteSlotConfigs.duck
    );

    const queryClient = useQueryClient();

    onMount(async () => {
        if (!isEditMode || !data.itemData || !data.itemId) return;
        const itemType: ItemType = data.itemData.itemData.$type;

        const loadedSlots = await Promise.all(
            spriteSlotConfigs[itemType].map(async (slot) => {
                const acceptParts: string[] = slot.accept.split('/');
                const extension: string = acceptParts[Math.max(acceptParts.length - 1, 0)];

                const cachedFile: File | undefined = queryClient.getQueryData([data.itemId, slot.key, extension ])
                 if (cachedFile) {
                    return { ...slot, file: cachedFile };
                }

                const cloudfrontFilePath: string = `https://d3018wbyyxg1xc.cloudfront.net/${itemType}/${data.itemId}/${slot.key}`;
                const file = await urlToFile(cloudfrontFilePath, slot.key);
                if (!file) return slot;

                queryClient.setQueryData([ data.itemId, slot.key, extension ], file)
                return { ...slot, file };
            })
        );

        spriteSlots = loadedSlots;
    });

    $effect(() => {
        spriteSlots = spriteSlotConfigs[formContents.itemData.$type].map(s => ({ ...s, file: undefined }));
    });

    const urlToFile = async (url: string, filename: string): Promise<File | undefined> => {
        try {
            const response = await fetch(url, { 
                mode: 'cors',
                credentials: 'omit' 
            });
            const blob = await response.blob();
            return new File([blob], filename, { type: blob.type });
        } catch (err) {
            toast.error(`Error getting file: ${err}`)
        }
    }

    let primarySprite: File | undefined = $derived(spriteSlots.at(0)?.file);

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
            formData.append('sprites', new File([file], slot.key, {
                type: file.type 
            }));
        })
        if (isEditMode && data.itemId){
            formData.append("itemId", data.itemId);
        }
        FetchFromApi<ItemCreateResponseDto>("admin/item", {
            method: isEditMode ? "PUT" : "POST",
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

<svelte:head>
	<title>Admin - Algoduck</title>
</svelte:head>

<main class="w-full min-h-screen bg-admin-bg-primary text-admin-text-secondary">
    <div class="max-w-4xl mx-auto grow p-6 flex flex-col gap-5">
        <div class="py-4 border-b border-admin-border-primary">
            <div class="flex items-center gap-3">
                <a href="/items" class="p-1.5 rounded hover:bg-admin-border-primary transition-colors text-admin-text-muted hover:text-admin-text-secondary">
                    <ChevronIconSvgNew options={{ class: "w-5 h-5 stroke-[2] rotate-180 stroke-admin-text-muted" }}/>
                </a>
                <h2 class="text-2xl font-normal text-admin-text-primary tracking-tight">{isEditMode ? "Update" : "Create"} Item</h2>
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
                        <div class="flex flex-row gap-3 justify-end grow">
                            {#if isEditMode}
                                <ToolTip options={{tip: 'cannot change item type \ntry recreating the item from scratch'}}/>
                            {/if}
                            <div class="flex flex-row items-center gap-1 bg-admin-border-primary rounded-full p-1">
                                {#each ItemTypes as itemType}
                                    <button disabled={isEditMode} onclick={() => {
                                        formContents.itemData.$type = itemType
                                    }} class="px-3 py-1 rounded-full disabled:cursor-not-allowed text-xs transition-all disabled:text-admin-text-muted
                                        {formContents.itemData.$type === itemType ? 'bg-admin-accent-primary text-admin-text-secondary font-medium' : 'font-medium text-admin-text-muted hover:text-admin-text-secondary'}">
                                        <span>{itemType}</span>
                                    </button>
                                {/each}
                            </div>
                        </div>
                </div>
                <div class="p-4 flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                        <span class="text-sm text-admin-text-secondary">
                            Name <span class="text-admin-danger-text">*</span>
                        </span>
                        <input type="text" bind:value={formContents.itemName} maxlength={128} placeholder="Enter item name"
                            class="w-full justify-end px-3 py-2 bg-admin-border-primary border border-admin-border-primary rounded text-sm text-admin-text-secondary placeholder-admin-text-muted outline-none transition-colors focus:border-[#007fd4]"/>
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
                                {#each data.rarities as rarity}
                                    <option value={rarity.rarityId}>{rarity.name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {#if formContents.itemData.$type === "plant"}
                <PlantCreationForm bind:itemData={ formContents.itemData as PlantData } sprite={primarySprite}/>
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
                        <div class="w-5 h-5 border-2 border-gray-500 border-t-0 rounded-full animate-spin"></div>
                        <span>Creating...</span>
                    {:else}
                        <CrossIconSvg options={{ class: 'w-4 h-4 stroke-[2] rotate-45 stroke-admin-text-secondary' }}/>
                        <span>{isEditMode ? "Update Item" : "Create Item"}</span>
                    {/if}
                </button>
            </div>
        {/if}
    </div>
</main>