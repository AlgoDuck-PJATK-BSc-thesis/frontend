<script lang="ts">
	import { activeProfile, ComponentRegistry } from "$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte";
	import type { ControlPanelArgs } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";

    let { options = $bindable() }: {options: ControlPanelArgs} = $props();
</script>

<main class="w-12 h-full bg-ide-bg flex flex-col justify-start items-center gap-3">
    {#each options.labels.filter(l => l.icon?.component !== undefined) as label}
        {@const Comp = ComponentRegistry.get(activeProfile.profile)!.get(label.icon?.component!)}
        <button 
        class="w-[80%] bg-blue-500 aspect-square rounded-md p-[5%]
        {options.selectedElemId === label.labelFor ? "stroke-ide-text-secondary bg-blue-500" : "stroke-ide-text-primary bg-ide-bg hover:bg-ide-text-primary/10"}" 
        onclick="{()=>{options.selectedElemId = label.labelFor}}">
            <Comp options={{class: "w-full h-full"}}/>
        </button>
    {/each}

</main>