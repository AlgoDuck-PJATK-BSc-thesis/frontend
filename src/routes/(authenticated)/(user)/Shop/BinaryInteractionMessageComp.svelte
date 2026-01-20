<script lang='ts'>
	import { fly, scale } from "svelte/transition";
	import { backOut } from "svelte/easing";
	import type { BinaryUserInteractionArgs } from "./Dtos";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import TickIconSvg from "$lib/svg/EditorComponentIcons/TickIconSvg.svelte";
	import { onMount } from "svelte";

    let { options = $bindable() }: { options: BinaryUserInteractionArgs } = $props();
    
    let yesHovered = $state(false);
    let noHovered = $state(false);
    let yesPressed = $state(false);
    let noPressed = $state(false);
    
    let chosenOption: 'yes' | 'no' | null = $state(null);

    onMount(() => {
        options.wasTypedFully = true;
    });
    
    const handleAccept = () => {
        if (chosenOption !== null) return;
        chosenOption = 'yes';
        options.onAccept();
    };
    
    const handleReject = () => {
        if (chosenOption !== null) return; 
        chosenOption = 'no';
        options.onReject();
    };
</script>

<main 
    in:fly={{ y: 60, duration: 500, easing: backOut }}
    out:scale={{ duration: 250, start: 0.9 }}
    class="w-full px-4 py-2 flex flex-row justify-end"
>
    <div class="relative w-[90%]">
        <div class="relative bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 rounded-2xl rounded-br-sm shadow-2xl border border-amber-500/30 overflow-hidden">
            <div class="relative px-5 py-4">
                <h4 class="text-amber-100 text-center text-lg font-semibold mb-4 pr-6 drop-shadow-lg">
                    {options.messageContents}
                </h4>
                
                <div class="flex flex-row justify-center gap-4">
                    <button 
                        class="relative group px-6 py-2.5 min-w-[80px] rounded-xl font-bold text-white transition-all duration-300 overflow-hidden"
                        class:scale-105={yesHovered && !yesPressed && chosenOption === null}
                        class:scale-95={yesPressed}
                        class:opacity-30={chosenOption === 'no'}
                        class:ring-2={chosenOption === 'yes'}
                        class:ring-emerald-400={chosenOption === 'yes'}
                        class:bg-emerald-600={chosenOption === 'yes'}
                        class:cursor-default={chosenOption !== null}
                        class:pointer-events-none={chosenOption !== null}
                        
                        onmouseenter={() => yesHovered = true}
                        onmouseleave={() => { yesHovered = false; yesPressed = false; }}
                        onmousedown={() => yesPressed = true}
                        onmouseup={() => yesPressed = false}
                        onclick={handleAccept}
                        disabled={chosenOption !== null}
                    >
                        <span class="relative flex items-center justify-center gap-1.5 drop-shadow-md">
                            <span class="transition-transform duration-200">
                                <TickIconSvg options={{ class: "w-4 h-4 stroke-[1] stroke-white"}}/>
                            </span>
                            <span>Yes</span>
                        </span>
                    </button>
                    
                    <button 
                        class="relative group px-6 py-2.5 min-w-[80px] rounded-xl font-bold text-white transition-all duration-300 overflow-hidden"
                        class:scale-105={noHovered && !noPressed && chosenOption === null}
                        class:scale-95={noPressed}
                        class:opacity-30={chosenOption === 'yes'}
                        class:ring-2={chosenOption === 'no'}
                        class:ring-red-400={chosenOption === 'no'}
                        class:bg-red-600={chosenOption === 'no'}
                        class:cursor-default={chosenOption !== null}
                        class:pointer-events-none={chosenOption !== null}

                        onmouseenter={() => noHovered = true}
                        onmouseleave={() => { noHovered = false; noPressed = false; }}
                        onmousedown={() => noPressed = true}
                        onmouseup={() => noPressed = false}
                        onclick={handleReject}
                        disabled={chosenOption !== null}>
                        <span class="relative flex items-center justify-center gap-1.5 drop-shadow-md">
                            <span class="transition-transform duration-200">
                                <CrossIconSvg options={{ class: "w-4 h-4 stroke-[1] stroke-white"}}/>
                            </span>
                            <span>No</span>
                        </span>
                    </button>
                </div>
                
            </div>
        </div>
    </div>
</main>