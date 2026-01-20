<script lang="ts">
    import { activeProfile, ComponentRegistry } from "$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte";
    import type { ControlPanelArgs, GroupData, Label } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
    import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
	import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";
    import type { svgArg } from "$lib/types/SvgIcon";
    import type { Component } from "svelte";

    let { options = $bindable() } : { options: ControlPanelArgs } = $props();
    let groups: Record<string, { groupData: GroupData, labels: Label[] }> = {};

    if (options.groups){
    options.groups.forEach(g => {
        groups[g.groupId] = {
        labels: options.labels.filter(lf => g.groupMembers.includes(lf.labelFor)),
        groupData: g,
        }
    });
    }

    const groupHeaderHeight: number = 15; 
    const itemHeight: number = 12; 
    let isGroupExpanded: boolean[] = $state(Array(Object.keys(groups).length).fill(true))
</script>

<div class="h-full w-48 shrink-0 bg-ide-card overflow-visible">
  <div class="w-full h-full flex flex-col gap-1 px-[1%] overflow-y-auto overflow-x-hidden justify-start items-center">
    {#each Object.keys(groups) as groupName, i}
      <div class="w-full transition-all duration-300 ease-out " style="height: {isGroupExpanded[i] ? `${groupHeaderHeight * 4 + (groups[groupName].labels.length * itemHeight) * 4}px` : `${groupHeaderHeight * 4}px`}">
        <button 
          onclick={() => {
            isGroupExpanded[i] = !isGroupExpanded[i];
          }}
          class="w-full h-12 flex justify-between items-center px-4 hover:cursor-pointer gap-[5%]"
        >
          <span class="w-full h-full flex justify-start text-ide-text-primary overflow-hidden font-semibold text-lg items-center">
            {groups[groupName].groupData.label.commonName}
          </span>
          <div class="w-4 h-4 min-w-4 min-h-4 transition-all duration-150 ease-out {isGroupExpanded[i] ? 'rotate-90' : 'rotate-0'}">
            <ChevronIconSvgNew options={{ class: "w-full h-full stroke-ide-text-primary"}}/>
          </div>
        </button>
        
        <div class="w-full flex flex-col gap-0.5 items-center overflow-hidden transition-all duration-300 ease-out" style="height: {isGroupExpanded[i] ? `${groups[groupName].labels.length * itemHeight * 4}px` : '0px'}">
          {#each groups[groupName].labels as label, j}
            {@const SvgIcon = ComponentRegistry.get(activeProfile.profile)?.get(label.icon?.component!) as Component<{options: svgArg}>}
            <button 
              class="w-[90%] h-10 p-2 flex justify-center items-center gap-2 hover:cursor-pointer {label.labelFor === options.selectedElemId ? 'bg-ide-bg/10' : 'hover:bg-ide-bg/5'} border-black rounded-md" 
              onclick={() => {options.selectedElemId = label.labelFor}}
            >
              <SvgIcon options={{ class: "w-4 h-4 stroke-ide-text-primary shrink-0" }}/>
              <span class="flex-1 text-ide-text-secondary text-left truncate">{label.commonName}</span>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>