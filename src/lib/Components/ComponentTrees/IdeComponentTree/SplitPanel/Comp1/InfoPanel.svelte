<script lang="ts">
    import MarkdownRenderer from '$lib/Components/Misc/MarkdownRenderer.svelte';
    import type { InfoPanelComponentArgs } from '../../component-args';
    let { options = $bindable() }: { options: InfoPanelComponentArgs } = $props();
	$inspect(options);
</script>

<main class="w-full h-full flex flex-col bg-ide-card overflow-y-auto overflow-x-hidden min-w-xl rounded-xl">
    <div class="px-8 pt-8 pb-6 border-b border-ide-accent/20">
        <h2 class="text-3xl font-bold text-ide-text-primary mb-4">
            {options.title}
        </h2>
        
        <div class="flex flex-wrap gap-2">
            {@render TagPill(options.title, true)}
            {#each options.tags as tag}
                {@render TagPill(tag.name, false)}
            {/each}
        </div>
    </div>
    
    <div class="px-8 py-6 flex-1">
        <MarkdownRenderer options={{ markdown: options.description, class: "prose prose-invert max-w-none text-ide-text-secondary"}} />
    </div>
</main>

{#snippet TagPill(tagContents: string, isPrimary: boolean)}
    <div
        class="px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200
            {isPrimary 
                ? 'bg-ide-accent/20 text-ide-accent border border-ide-accent/40' 
                : 'bg-ide-accent/5 text-ide-text-secondary/80 border border-ide-accent/20 hover:border-ide-accent/40 hover:bg-ide-accent/10'}">
        {tagContents}
    </div>
{/snippet}