<script lang='ts' generics='T extends Record<string, any>'>
	import type { Component } from "svelte";
	import type { RecommendationDisplayCompArgs, SuggestedInputArgs } from "./TestCase";
	import { fly, slide } from "svelte/transition";
	import SearchIconSvg from "$lib/svg/EditorComponentIcons/SearchIconSvg.svelte";

    let { options = $bindable() }: { options: SuggestedInputArgs<T> } = $props();

    let isFocused: boolean = $state(false);

    const toggleFocus = (): void => {
        isFocused = !isFocused;
    } 

    let query: string = $state('');
    let suggestions: T[] | undefined = $derived(options.getCurrentRecommendationsForQuery(query))
    let DisplayComponent: Component<{ options: RecommendationDisplayCompArgs<T> }> = $derived(options.DisplayComp);
</script>

<div class="relative flex-1 min-w-[200px]">
    <div class="relative flex items-center">
        <div class="absolute left-2.5">
            <SearchIconSvg options={{ class: "w-4 h-4 stroke-[2] stroke-[#858585]"}}/>
        </div>
        <input
            onfocus={toggleFocus}
            onblur={toggleFocus}
            bind:value={query}
            class="w-full h-8 pl-8 pr-8 bg-[#3c3c3c] border border-[#3c3c3c] rounded-sm text-[#cccccc] font-mono text-sm outline-none transition-all duration-150 placeholder:text-[#858585] placeholder:italic focus:border-[#007fd4] focus:shadow-[inset_0_0_0_1px_#007fd4]"
            placeholder="Type to search..."
        />
    </div>

    {#if isFocused && suggestions}
        <div transition:fly={{ y: -5, opacity: 0}} class="absolute top-[calc(100%+4px)] left-0 right-0 bg-[#252526] border border-[#3c3c3c] rounded z-999 overflow-hidden">
            <div class="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#3c3c3c]">
                <span class="text-[11px] font-semibold text-[#858585] uppercase tracking-wider">Suggestions</span>
                <span class="text-[10px] font-semibold text-[#858585] bg-[#37373d] px-1.5 py-0.5 rounded-full">{suggestions.length}</span>
            </div>
            <div class="max-h-60 overflow-y-auto">
                {#each suggestions as suggestion}
                    <DisplayComponent options={{
                        onSelect: (selected: T) => options.onSelect(selected),
                        content: suggestion
                    }}/>
                {:else}
                    <div class="flex flex-col items-center justify-center gap-2 py-6 px-4 text-[#858585]">
                        <span class="text-xs italic">No matches found</span>
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    @keyframes dropdownSlide {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>