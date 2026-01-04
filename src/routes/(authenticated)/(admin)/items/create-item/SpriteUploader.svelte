<script lang="ts">
    import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import ImageIconScg from "$lib/svg/EditorComponentIcons/ImageIconScg.svelte";
	import TickIconSvg from "$lib/svg/EditorComponentIcons/TickIconSvg.svelte";
	import QuestionMarkIconSvg from "$lib/svg/Toast/QuestionMarkIconSvg.svelte";
	import WarningIconSvg from "$lib/svg/Toast/WarningIconSvg.svelte";
	import type { SpriteSlot } from "./ItemCreationTypes";
    
    let { slots = $bindable() } : { slots: SpriteSlot[] } = $props();

    let filledCount = $derived(slots.filter(s => s.file).length);
    
    let previewMode: string = $state(slots[0]?.key ?? "");
    let dragOverSlot: string | null = $state(null);

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

        <div class="grid gap-4" style="grid-template-columns: repeat({slots.length}, 1fr);">
            {#each slots as slot}
                {@const preview = getPreviewUrl(slot.file)}
                <div class="group relative">
                    {#if slot.file}
                        <div class="aspect-square rounded-lg border-2 border-[#89d185] bg-admin-bg-primary overflow-hidden relative">
                            <div class="w-full h-full flex items-center justify-center bg-admin-bg-hover/20 p-3">
                                <img src={preview} alt={slot.label} class="max-w-full max-h-full object-contain" />
                            </div>
                            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-admin-bg-primary via-admin-bg-primary/90 to-transparent p-3 pt-6">
                                <div class="text-sm font-medium text-admin-text-secondary">{slot.label}</div>
                                <div class="text-xs text-[#89d185] truncate">{slot.file.name}</div>
                            </div>
                            <button onclick={() => removeFile(slot)}
                                class="absolute top-2 right-2 w-7 h-7 rounded-md bg-admin-bg-primary/80 hover:bg-admin-danger-bg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <CrossIconSvg options={{ class: "w-4 h-4 stroke-[2] stroke-admin-danger-text" }} />
                            </button>
                        </div>
                        <div class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#89d185] flex items-center justify-center shadow-lg">
                            <TickIconSvg options={{ class: 'w-3 h-3 stroke-[2] stroke-white'}}/>
                        </div>
                    {:else}
                        <label class="aspect-square rounded-lg border-2 border-dashed bg-admin-bg-primary flex flex-col items-center justify-center gap-2 p-4 cursor-pointer transition-all
                                {dragOverSlot === slot.key 
                                    ? 'border-admin-accent-link bg-admin-accent-selection/20' 
                                    : 'border-admin-border-primary hover:border-admin-accent-link hover:bg-admin-bg-primary/80'}"
                            ondragover={(e) => { e.preventDefault(); dragOverSlot = slot.key; }}
                            ondragleave={() => dragOverSlot = null}
                            ondrop={(e) => handleDrop(slot, e)}
                        >
                            <input type="file" accept={slot.accept} class="hidden" onchange={(e) => handleFileSelect(slot, e)}/>
                            <div class="w-10 h-10 rounded-full bg-admin-border-primary flex items-center justify-center group-hover:bg-admin-accent-selection/30 transition-colors">
                                <CrossIconSvg options={{ class: 'w-5 h-5 stroke-[2] rotate-45 stroke-admin-text-muted group-hover:stroke-admin-accent-link'}}/>
                            </div>
                            <div class="text-center">
                                <div class="text-sm font-medium text-admin-text-secondary">{slot.label}</div>
                                <div class="text-xs text-admin-text-muted">{slot.description}</div>
                            </div>
                        </label>

                        <WarningIconSvg options={{ class: 'absolute -top-2 -right-2 w-5 h-5 stroke-[2] rounded-full stroke-admin-text-secondary bg-admin-danger-text/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg' }}/>
                    {/if}
                </div>
            {/each}
        </div>

        <div class="flex items-center gap-2 text-xs text-admin-text-muted">
            <QuestionMarkIconSvg options={{ class: 'w-4 h-4 stroke-admin-text-muted stroke-[2]' }}/>
            <span>Drag and drop onto each slot, or click to browse. Max 512KB per file.</span>
        </div>
    </div>
</div>