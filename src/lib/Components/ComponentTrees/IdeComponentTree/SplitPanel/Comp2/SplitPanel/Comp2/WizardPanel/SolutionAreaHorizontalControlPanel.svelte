<script lang="ts">
	import { activeProfile, ComponentRegistry } from "$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte";
	import type { ControlPanelArgs } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";

    let { options = $bindable() }: {options: ControlPanelArgs} = $props();

    const handleSelect = (selected: string) => {
        if (options.controlCallbacks?.select){
            options.controlCallbacks!.select(selected);
        }else{
            options.selectedElemId = selected;
        }
    }

</script>

<main class="h-14 shrink-0 py-2 w-full">
    <div class="w-full h-full flex flex-row rounded-lg justify-start items-center gap-3 bg-ide-card py-1 px-2">
        {#each options.labels.filter(l => l.icon?.component !== undefined) as label}
            {@const Comp = ComponentRegistry.get(activeProfile.profile)!.get(label.icon?.component!)}
            <button 
            class="h-full min-w-30 rounded-md flex flex-row justify-center gap-3 px-8 items-center
            {options.selectedElemId === label.labelFor ? "stroke-ide-text-secondary border-2 bg-ide-accent/10 border-ide-accent" : "stroke-ide-text-primary bg-ide-bg hover:bg-ide-text-primary/10"}" 
            onclick="{()=>{handleSelect(label.labelFor)}}">
                <Comp options={{class: "h-[60%] aspect-square"}}/>
                <span class="text-xs font-mono text-ide-text-primary">{label.commonName}</span>
            </button>
        {/each}
    </div>
</main>