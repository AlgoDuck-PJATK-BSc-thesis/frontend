<script lang="ts">
    import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";
    import ImageIconScg from "$lib/svg/EditorComponentIcons/ImageIconScg.svelte";
    import TickIconSvg from "$lib/svg/EditorComponentIcons/TickIconSvg.svelte";
    import QuestionMarkIconSvg from "$lib/svg/Toast/QuestionMarkIconSvg.svelte";
    import WarningIconSvg from "$lib/svg/Toast/WarningIconSvg.svelte";
    import type { SpriteSlot } from "./ItemCreationTypes";
    
    let { slots = $bindable() } : { slots: SpriteSlot[] } = $props();

    const SLOTS_PER_PAGE = 3;
    
    let filledCount = $derived(slots.filter(s => s.file).length);
    let totalPages = $derived(Math.ceil(slots.length / SLOTS_PER_PAGE));
    let currentPage = $state(0);
    
    let previewMode: string = $state(slots[0]?.key ?? "");
    let dragOverSlot: string | null = $state(null);

    let visibleSlots = $derived(
        slots.slice(currentPage * SLOTS_PER_PAGE, (currentPage + 1) * SLOTS_PER_PAGE)
    );

    const goToPage = (page: number) => {
        if (page >= 0 && page < totalPages) {
            currentPage = page;
        }
    };

    const handleDrop = (slot: SpriteSlot, e: DragEvent) => {
        e.preventDefault();
        dragOverSlot = null;
        const file = e.dataTransfer?.files[0];
        if (file && file.type.startsWith("image/")) {
            slot.file = file;
        }
    };

    const handleFileSelect = (slot: SpriteSlot, e: Event) => {
        const input = e.target as HTMLInputElement;
        if (input.files?.[0]) {
            slot.file = input.files[0];
        }
    };

    const removeFile = (slot: SpriteSlot) => {
        slot.file = undefined;
    };

    const getPreviewUrl = (file: File | undefined): string | null => {
        return file ? URL.createObjectURL(file) : null;
    };

    let ActiveSlot = $derived(slots.find(s => s.key === previewMode) ?? slots[0]);
    let Preview = $derived(ActiveSlot ? getPreviewUrl(ActiveSlot.file) : null);
</script>

<div class="bg-admin-bg-secondary border border-admin-border-primary rounded-lg overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary">
        <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">
            <span>Sprites</span>
            <span class="text-admin-danger-text">*</span>
        </h3>
        <div class="flex items-center gap-2 text-xs">
            <span class={filledCount === slots.length ? "text-[#89d185]" : "text-admin-text-muted"}>
                {filledCount}/{slots.length}
            </span>
            <span class="text-admin-text-muted">uploaded</span>
        </div>
    </div>
    
    <div class="p-5 flex flex-col gap-5">
        <div class="p-4 bg-admin-bg-primary rounded-lg border border-admin-border-primary">
            <div class="flex items-center justify-between mb-3">
                <div class="text-xs text-admin-text-muted uppercase tracking-wider">Preview</div>
                {#if slots.length > 1}
                    <div class="flex flex-row items-center gap-1 bg-admin-border-primary rounded-full p-1">
                        {#each slots as slot}
                            <button onclick={() => previewMode = slot.key} class="px-3 py-1 rounded-full text-xs transition-all
                                    {previewMode === slot.key ? 'bg-admin-accent-primary text-white font-medium' : 'text-admin-text-muted hover:text-admin-text-secondary'}">
                                <span>{slot.label}</span>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
            <div class="h-32 rounded-lg bg-admin-bg-secondary flex items-center justify-center relative overflow-hidden">
                <div class="w-24 h-24 flex items-center justify-center">
                    {#if Preview}
                        <img src={Preview} alt={ActiveSlot.label} class="max-w-full max-h-full object-contain" />
                    {:else}
                        <div class="flex flex-col items-center gap-2 text-admin-text-muted">
                            <ImageIconScg options={{ class: 'w-10 h-10 stroke-[1] stroke-admin-text-muted' }}/>
                            <span class="text-xs">{ActiveSlot?.label ?? "No preview"}</span>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <div class="relative">
            {#if totalPages > 1}
                <button 
                    onclick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                    class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-admin-bg-tertiary border border-admin-border-primary flex items-center justify-center transition-all
                        {currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-admin-accent-selection hover:border-admin-accent-link cursor-pointer'}">
                    <ChevronIconSvgNew options={{ class: 'w-4 h-4 stroke-[2] stroke-admin-text-primary rotate-180'}}/>
                </button>
                
                <button 
                    onclick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-admin-bg-tertiary border border-admin-border-primary flex items-center justify-center transition-all
                        {currentPage >= totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-admin-accent-selection hover:border-admin-accent-link cursor-pointer'}"
                >
                    <ChevronIconSvgNew options={{ class: 'w-4 h-4 stroke-[2] stroke-admin-text-primary'}}/>
                </button>
            {/if}

            <div class="grid grid-cols-3 gap-4 px-2">
                {#each visibleSlots as slot (slot.key)}
                    {@const preview = getPreviewUrl(slot.file)}
                    <div class="group relative">
                        {#if slot.file}
                            <div class="aspect-square rounded-lg border-2 border-[#89d185] bg-admin-bg-primary overflow-hidden relative">
                                <div class="w-full h-full flex items-center justify-center bg-admin-bg-hover/20 p-3">
                                    <img src={preview} alt={slot.label} class="max-w-full max-h-full object-contain" />
                                </div>
                                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-admin-bg-primary via-admin-bg-primary/90 to-transparent p-2 pt-4">
                                    <div class="text-xs font-medium text-admin-text-secondary truncate">{slot.label}</div>
                                    <div class="text-[10px] text-[#89d185] truncate">{slot.file.name}</div>
                                </div>
                                <button onclick={() => removeFile(slot)}
                                    class="absolute top-2 right-2 w-6 h-6 rounded-md bg-admin-bg-primary/80 hover:bg-admin-danger-bg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <CrossIconSvg options={{ class: "w-3 h-3 stroke-[2] stroke-admin-danger-text" }} />
                                </button>
                            </div>
                            <div class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#89d185] flex items-center justify-center shadow-lg">
                                <TickIconSvg options={{ class: 'w-2.5 h-2.5 stroke-[2] stroke-white'}}/>
                            </div>
                        {:else}
                            <label class="aspect-square rounded-lg border-2 border-dashed bg-admin-bg-primary flex flex-col items-center justify-center gap-1.5 p-2 cursor-pointer transition-all
                                    {dragOverSlot === slot.key 
                                        ? 'border-admin-accent-link bg-admin-accent-selection/20' 
                                        : 'border-admin-border-primary hover:border-admin-accent-link hover:bg-admin-bg-primary/80'}"
                                ondragover={(e) => { e.preventDefault(); dragOverSlot = slot.key; }}
                                ondragleave={() => dragOverSlot = null}
                                ondrop={(e) => handleDrop(slot, e)}
                            >
                                <input type="file" accept={slot.accept} class="hidden" onchange={(e) => handleFileSelect(slot, e)}/>
                                <div class="w-8 h-8 rounded-full bg-admin-border-primary flex items-center justify-center group-hover:bg-admin-accent-selection/30 transition-colors">
                                    <CrossIconSvg options={{ class: 'w-4 h-4 stroke-[2] rotate-45 stroke-admin-text-muted group-hover:stroke-admin-accent-link'}}/>
                                </div>
                                <div class="text-center">
                                    <div class="text-xs font-medium text-admin-text-secondary">{slot.label}</div>
                                    <div class="text-[10px] text-admin-text-muted leading-tight">{slot.description}</div>
                                </div>
                            </label>

                            <WarningIconSvg options={{ class: 'absolute -top-1.5 -right-1.5 w-4 h-4 stroke-[2] rounded-full stroke-admin-text-secondary bg-admin-danger-text/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg' }}/>
                        {/if}
                    </div>
                {/each}
                
                {#each Array(SLOTS_PER_PAGE - visibleSlots.length) as _}
                    <div class="aspect-square rounded-lg border-2 border-dashed border-admin-border-primary/30 bg-admin-bg-primary/30"></div>
                {/each}
            </div>

            {#if totalPages > 1}
                <div class="flex items-center justify-center gap-2 mt-4">
                    {#each Array(totalPages) as _, i}
                        <button aria-label={`page-${i}`}
                            onclick={() => goToPage(i)}
                            class="w-2 h-2 rounded-full transition-all {currentPage === i 
                                ? 'bg-admin-accent-primary w-5' 
                                : 'bg-admin-border-primary hover:bg-admin-text-muted'}"
                        ></button>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="flex items-center gap-2 text-xs text-admin-text-muted">
            <QuestionMarkIconSvg options={{ class: 'w-4 h-4 stroke-admin-text-muted stroke-[2]' }}/>
            <span>Drag and drop onto each slot, or click to browse. Max 512KB per file.</span>
        </div>
    </div>
</div>