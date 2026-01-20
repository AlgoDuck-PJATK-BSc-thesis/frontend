<script lang="ts">
	import type { Item } from "./Dtos";

    let { options, onclick } : { options: Item, onclick: (() => void) } = $props();
    
    let isHovered = $state(false);
    let isPressed = $state(false);
    
    let effectiveHover = $derived(isHovered && !options.isOwned);
    let effectivePress = $derived(isPressed && !options.isOwned);
</script>

<main class="w-full h-full p-5 flex justify-center items-center">
    <button 
        onclick={options.isOwned ? undefined : onclick}
        onmouseenter={() => isHovered = true}
        onmouseleave={() => { isHovered = false; isPressed = false; }}
        onmousedown={() => isPressed = true}
        onmouseup={() => isPressed = false}
        disabled={options.isOwned}
        class="group relative w-full h-full flex justify-center items-center transition-transform duration-200 ease-out {effectivePress ? "scale-95" : effectiveHover ? "scale-110" : ""} {options.isOwned ? "cursor-not-allowed" : "cursor-pointer"}">
        {#if effectiveHover}
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
                <span class="absolute top-[10%] left-[20%] w-2 h-2 bg-yellow-200 rounded-full animate-ping opacity-75"></span>
                <span class="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                <span class="absolute bottom-[25%] left-[30%] w-1 h-1 bg-amber-200 rounded-full animate-bounce"></span>
            </div>
        {/if}
        
        <img 
            src={`https://d3018wbyyxg1xc.cloudfront.net/plant/${options.itemId}/Day.png`} 
            alt={options.description}
            class="relative z-10 max-h-[60%] max-w-full object-contain drop-shadow-lg transition-all duration-300 {options.isOwned ? "grayscale opacity-50" : ""}"
        >
        
        {#if options.isOwned}
            <div class="absolute inset-0 z-20 flex justify-center items-center">
                <div class="bg-slate-900/70 px-4 py-2 rounded-lg rotate-[-12deg] shadow-lg border border-slate-600">
                    <span class="text-slate-200 font-bold text-sm tracking-wider uppercase">Owned</span>
                </div>
            </div>
        {/if}
        
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 h-[15%] max-h-[20%] min-h-[10%] min-w-[20%] to-yellow-500 rounded-full shadow-lg transition-all duration-300 flex items-center gap-[10%] px-[4%] py-[1%] {effectiveHover ? "opacity-100" : "opacity-0 translate-y-2"}">
            <span class="text-white text-sm font-bold drop-shadow">{options.price}</span> 
            <img class="h-[99%] aspect-square" src="/src/lib/images/store/coin.png" alt="coin" />
        </div>
    </button>
</main>