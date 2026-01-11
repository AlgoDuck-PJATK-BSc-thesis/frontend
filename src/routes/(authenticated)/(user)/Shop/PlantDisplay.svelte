<script lang="ts">
	import type { Item } from "./Dtos";

    let { options, onclick } : { options: Item, onclick: (() => void) } = $props();
    
    let isHovered = $state(false);
    let isPressed = $state(false);
</script>

<main class="w-full h-full p-5 flex justify-center items-center">
    <button 
        {onclick} 
        onmouseenter={() => isHovered = true}
        onmouseleave={() => { isHovered = false; isPressed = false; }}
        onmousedown={() => isPressed = true}
        onmouseup={() => isPressed = false}
        class="group relative w-full h-full flex justify-center items-center transition-transform duration-200 ease-out {isPressed ? "scale-95" : isHovered ? "scale-110" : ""}"
    >
        {#if isHovered}
            <div class="absolute inset-0 pointer-events-none overflow-hidden">
                <span class="absolute top-[10%] left-[20%] w-2 h-2 bg-yellow-200 rounded-full animate-ping opacity-75"></span>
                <span class="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                <span class="absolute bottom-[25%] left-[30%] w-1 h-1 bg-amber-200 rounded-full animate-bounce"></span>
            </div>
        {/if}
        
        <img src={`https://d3018wbyyxg1xc.cloudfront.net/plant/${options.itemId}/Day.png`} alt={options.description}
            class="relative z-10 max-h-[60%] max-w-full object-contain drop-shadow-lg transition-all duration-300">        
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 h-[15%] max-h-[20%] min-h-[10%] min-w-[20%] to-yellow-500 rounded-full shadow-lg transition-all duration-300 flex items-center gap-[10%] px-[4%] py-[1%] {isHovered ? "opacity-100" : "opacity-0 translate-y-2"}">
            <span class="text-white text-sm font-bold drop-shadow">{options.price}</span> 
            <img class="h-[99%] aspect-square" src="/src/lib/images/store/coin.png" alt="coin" />
        </div>
    </button>
</main>
