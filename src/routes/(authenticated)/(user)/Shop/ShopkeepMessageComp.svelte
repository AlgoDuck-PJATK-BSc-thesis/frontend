<script lang='ts'>
	import { fly, scale } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import type { ShopkeepPrompt } from "./Dtos";
	import { onMount } from "svelte";

    let { options = $bindable() }: { options: ShopkeepPrompt } = $props();
    
    let displayedText = $state("");

    $inspect(options);
    
    onMount(() => {
        if (!options.wasTypedFully){
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < options.messageContents.length) {
                    displayedText = options.messageContents.slice(0, i + 1);
                    i++;
                } else {
                    options.wasTypedFully = true;
                    clearInterval(typeInterval);
                }
            }, 30);   

            return () => clearInterval(typeInterval);
        }else{
            displayedText = options.messageContents;
        }
    });
</script>

<main 
    in:fly={{ y: 50, duration: 400, easing: quintOut }}
    out:scale={{ duration: 200, start: 0.8 }}
    class="w-full px-4 py-2 flex flex-row justify-start"
>
    <div class="relative w-[90%]">
        <div class="relative bg-gradient-to-br from-amber-50 via-white to-yellow-50 rounded-2xl rounded-bl-sm shadow-lg border-2 border-amber-200/60 overflow-hidden">
            <div class="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-amber-100/50 to-transparent"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-yellow-100/50 to-transparent"></div>
            
            <div class="relative px-4 py-3">
                <h4 class="text-amber-900 text-lg font-medium leading-relaxed pl-5">
                    {displayedText}
                    <span class="inline-block w-0.5 h-5 bg-amber-600 ml-0.5 align-middle" class:animate-blink={!options.wasTypedFully} class:opacity-0={options.wasTypedFully}></span>
                </h4>
            </div>
        </div>
        
        <div class="absolute -bottom-2 left-4 w-4 h-4 bg-gradient-to-br from-white to-amber-50 border-l-2 border-b-2 border-amber-200/60 transform rotate-[-35deg] -skew-x-12"></div>
    </div>
</main>

<style>
    @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }
    
    .animate-blink {
        animation: blink 0.8s infinite;
    }
</style>