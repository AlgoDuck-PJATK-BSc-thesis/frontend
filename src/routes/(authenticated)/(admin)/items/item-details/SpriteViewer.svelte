<script lang="ts">
    import ImageIconScg from "$lib/svg/EditorComponentIcons/ImageIconScg.svelte";
    import { getSpriteConfigForType, type ItemType } from "./ItemDetailsTypes";

    let { itemId, itemType }: { itemId: string; itemType: ItemType } = $props();

    const spriteConfig = $derived(getSpriteConfigForType(itemType));
    
    let activeSprite: string = $state(spriteConfig[0]?.key ?? "");

    const getSpriteUrl = (key: string): string => {
        return `https://d3018wbyyxg1xc.cloudfront.net/${itemType.at(0)?.toUpperCase()}${itemType.slice(1)}s/${itemId}/${key}`;
    };

    let activeUrl = $derived(getSpriteUrl(activeSprite));

    let imageError: boolean = $state(false);

    const handleImageError = () => {
        imageError = true;
    };

    const handleImageLoad = () => {
        imageError = false;
    };

    $effect(() => {
        activeSprite;
        imageError = false;
    });
</script>

<div class="bg-admin-bg-secondary border border-admin-border-primary rounded-lg overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary">
        <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Sprites</h3>
        <span class="text-xs text-admin-text-muted">{spriteConfig.length} sprites</span>
    </div>

    <div class="p-5 flex flex-col gap-5">
        <div class="p-4 bg-admin-bg-primary rounded-lg border border-admin-border-primary">
            <div class="flex items-center justify-between mb-3">
                <div class="text-xs text-admin-text-muted uppercase tracking-wider">Preview</div>
                {#if spriteConfig.length > 1}
                    <div class="flex flex-row items-center gap-1 bg-admin-border-primary rounded-full p-1">
                        {#each spriteConfig as sprite}
                            <button
                                onclick={() => activeSprite = sprite.key}
                                class="px-3 py-1 rounded-full text-xs transition-all
                                    {activeSprite === sprite.key 
                                        ? 'bg-admin-accent-primary text-white font-medium' 
                                        : 'text-admin-text-muted hover:text-admin-text-secondary'}"
                            >
                                <span>{sprite.label}</span>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
            <div class="h-48 rounded-lg bg-admin-bg-secondary flex items-center justify-center relative overflow-hidden">
                <div class="w-32 h-32 flex items-center justify-center">
                    {#if !imageError}
                        <img
                            src={activeUrl}
                            alt={spriteConfig.find(s => s.key === activeSprite)?.label ?? "Sprite"}
                            class="max-w-full max-h-full object-contain"
                            onerror={handleImageError}
                            onload={handleImageLoad}
                        />
                    {:else}
                        <div class="flex flex-col items-center gap-2 text-admin-text-muted">
                            <ImageIconScg options={{ class: 'w-10 h-10 stroke-[1] stroke-admin-text-muted' }} />
                            <span class="text-xs">Failed to load</span>
                        </div>
                    {/if}
                </div>
            </div>
        </div>

        <div class="grid gap-4" style="grid-template-columns: repeat({spriteConfig.length}, 1fr);">
            {#each spriteConfig as sprite}
                {@const url = getSpriteUrl(sprite.key)}
                <button
                    onclick={() => activeSprite = sprite.key}
                    class="group relative aspect-square rounded-lg border-2 overflow-hidden transition-all
                        {activeSprite === sprite.key 
                            ? 'border-admin-accent-primary bg-admin-bg-primary' 
                            : 'border-admin-border-primary bg-admin-bg-primary hover:border-admin-accent-link'}"
                >
                    <div class="w-full h-full flex items-center justify-center p-3">
                        <img
                            src={url}
                            alt={sprite.label}
                            class="max-w-full max-h-full object-contain"
                            onerror={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'}
                        />
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-admin-bg-primary via-admin-bg-primary/90 to-transparent p-2 pt-4">
                        <div class="text-xs font-medium text-admin-text-secondary text-center">{sprite.label}</div>
                    </div>
                    {#if activeSprite === sprite.key}
                        <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-admin-accent-primary"></div>
                    {/if}
                </button>
            {/each}
        </div>
    </div>
</div>