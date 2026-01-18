<script lang="ts">
	import type { Item } from "./Dtos";

    let { options, onclick } : { options: Item, onclick: (() => void) } = $props();
    
    let isHovered = $state(false);
    let isPressed = $state(false);
    
    let effectiveHover = $derived(isHovered && !options.isOwned);
    let effectivePress = $derived(isPressed && !options.isOwned);
</script>

<main class="w-full h-full p-5 flex justify-center items-center">
    <button onclick={options.isOwned ? undefined : onclick} onmouseenter={() => isHovered = true}
        onmouseleave={() => { isHovered = false; isPressed = false; }}
        onmousedown={() => isPressed = true}
        onmouseup={() => isPressed = false}
        disabled={options.isOwned}
        class="group relative w-full h-full flex justify-center items-center transition-transform duration-200 ease-out"
        class:scale-110={effectiveHover && !effectivePress}
        class:scale-95={effectivePress}
        class:cursor-not-allowed={options.isOwned}
        class:cursor-pointer={!options.isOwned}>
        <div class="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/0 via-yellow-400/0 to-orange-300/0 blur-xl transition-all duration-300"
            class:from-amber-300={effectiveHover}
            class:via-yellow-400={effectiveHover}
            class:to-orange-300={effectiveHover}
        ></div>
        
        <img src={`https://d3018wbyyxg1xc.cloudfront.net/duck/${options.itemId}/Sprite.png`} 
            alt={options.description}
            class="relative z-10 max-h-full max-w-full object-contain drop-shadow-lg transition-all duration-300"
            class:animate-float={effectiveHover}
            class:grayscale={options.isOwned}
            class:opacity-50={options.isOwned}>
        
        {#if options.isOwned}
            <div class="absolute inset-0 z-20 flex justify-center items-center">
                <div class="bg-slate-900/70 px-4 py-2 rounded-lg rotate-[-12deg] shadow-lg border border-slate-600">
                    <span class="text-slate-200 font-bold text-sm tracking-wider uppercase">Owned</span>
                </div>
            </div>
        {/if}
        
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-lg transition-all duration-300 flex items-center gap-1"
            class:opacity-0={!effectiveHover}
            class:translate-y-2={!effectiveHover}
            class:opacity-100={effectiveHover}
            class:translate-y-0={effectiveHover}>

            <span class="text-white text-sm font-bold drop-shadow">{options.price}</span>
            <img class="h-6 w-6" src="/src/lib/images/store/coin.png" alt="coin" />
        </div>
    </button>
</main>

<style>
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(-2deg); }
        50% { transform: translateY(-8px) rotate(2deg); }
    }
    
    .animate-float {
        animation: float 2s ease-in-out infinite;
    }
</style>