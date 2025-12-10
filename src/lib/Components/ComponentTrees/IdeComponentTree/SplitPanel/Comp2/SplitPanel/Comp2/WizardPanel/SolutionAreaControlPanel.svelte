<script lang="ts">
	import { activeProfile, ComponentRegistry } from "$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte";
	import type { ControlPanelArgs } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";

    let { options = $bindable() }: {options: ControlPanelArgs} = $props();

    const handleSelect = (seleceted: string) => {
        if (options.controlCallbacks?.select){
            options.controlCallbacks?.select(seleceted);
        }else{
            options.selectedElemId = seleceted;
        }
    }
</script>

<main class="w-12 shrink-0 h-full bg-ide-bg flex flex-col justify-start items-center gap-3">
    {#each options.labels.filter(l => l.icon?.component !== undefined) as label}
        {@const Comp = ComponentRegistry.get(activeProfile.profile)!.get(label.icon?.component!)}
        <button 
        class="w-[70%] aspect-square rounded-md p-[5%]
        {options.selectedElemId === label.labelFor ? "stroke-ide-text-secondary border-2 bg-ide-accent/10 border-ide-accent" : "stroke-ide-text-primary bg-ide-bg hover:bg-ide-text-primary/10"}" 
        onclick="{()=>{handleSelect(label.labelFor)}}">
            <Comp options={{class: "w-full h-full"}}/>
        </button>
    {/each}
</main>