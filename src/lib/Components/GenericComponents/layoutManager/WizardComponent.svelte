<script lang="ts">
	import { activeProfile, ComponentRegistry } from "./ComponentRegistry.svelte";

	import type { ComponentConfig, ControlPanelArgs, LayoutManagerComponentArgs, WizardComponentArg } from "./ResizableComponentArg";
	import { type Component } from "svelte";

  let { options = $bindable() }: { options: WizardComponentArg} = $props();
  const controlPanel: ComponentConfig<ControlPanelArgs> = $derived(options.control);

  const compToCompIdMapping: Record<string, ComponentConfig<any>> | undefined = $derived(options?.components === undefined ? {} : Object.fromEntries(options.components.map(c => [c.options.component.compId, c])))

  let selectedElemId: string = $derived((options?.components ?? [])[0]?.options?.component?.compId ?? "")

  let controlPanelOpts: ControlPanelArgs = $derived({
    ...options.control.options,
    labels: (options?.components ?? []).filter(comp => comp.options.component.meta !== undefined && comp.options.component.meta.label != undefined).map(comp => comp.options!.component.meta!.label!),
    selectedElemId: selectedElemId,
    onSelect: (seleceted: string) => {
      selectedElemId = seleceted;
    },
    side: options?.side ?? 0 ,
    groups: options?.groups ?? []
  });

  const ControlPanelComp: Component<{options: ControlPanelArgs}> | undefined= $derived(ComponentRegistry.get(activeProfile.profile)?.get(controlPanel.component))

  let Comp: Component<{options: any}> | undefined = $derived( controlPanelOpts.selectedElemId ? ComponentRegistry.get(activeProfile.profile)!.get(compToCompIdMapping[controlPanelOpts.selectedElemId]?.component) : undefined)
  let componentOpts: LayoutManagerComponentArgs | undefined = $derived(controlPanelOpts.selectedElemId ? compToCompIdMapping[controlPanelOpts.selectedElemId]?.options : undefined);  

</script>

<main class="w-full h-full overflow-hidden flex {options.side === 0 ? 'flex-col' : ''} {options.side === 1 ? 'flex-row-reverse' : ''} {options.side === 2 ? 'flex-col-reverse' : ''}">
  <ControlPanelComp options={controlPanelOpts}/>
  {#if componentOpts && Comp}  
    <div bind:this={options.componentsContainer} class="w-full grow bg-bg min-h-0">
      <Comp bind:options={componentOpts}/>
    </div>
  {/if}
</main>