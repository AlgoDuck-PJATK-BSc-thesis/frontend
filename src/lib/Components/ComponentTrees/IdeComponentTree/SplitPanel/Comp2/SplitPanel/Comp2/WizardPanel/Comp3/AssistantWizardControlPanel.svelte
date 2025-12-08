<script lang="ts">
	import type { ControlPanelArgs } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";

    let { options = $bindable() }: {options: ControlPanelArgs} = $props();
    $inspect(options);

    const handleSelect = (selected: string) => {
        if (options.onSelect){
            options.onSelect(selected);
        }else{
            options.selectedElemId = selected;
        }
    }
</script>

<main class="w-70 h-full bg-ide-card border-r-2 border-r-ide-dcard flex flex-col gap-3 justify-start items-center">
    <div class="w-full flex flex-col items-center">
        <div class="w-full py-2 px-1">
            <button class="flex w-full h-10 rounded-full flex-row justify-center gap-2 items-center bg-ide-dcard/50 transition-colors duration-300 ease-out hover:bg-ide-dcard">
                <CrossIconSvg options={{ class: "h-4 w-4 stroke-ide-text-secondary rotate-45 stroke-[3]" }}/>
                <span class="text-sm font-semibold">New Chat</span>
            </button>
        </div>
    </div>
    <div class="w-full h-full flex flex-col justify-start px-3 gap-2">
        <span class="w-full flex justify-start font-mono text-xs text-ide-text-secondary">Recent</span>
        <div class="w-full flex flex-col items-center justify-start gap-1">
            {#each options.labels as label}
            <button onclick={() => {handleSelect(label.labelFor)}} class="w-full h-10 hover:bg-ide-dcard px-3 rounded-md">
                <span class="w-full flex items-start">{label.commonName}</span>
            </button>
            {/each}
        </div>
    </div>
</main>