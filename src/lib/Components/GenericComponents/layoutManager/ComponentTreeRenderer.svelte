<script lang="ts">
  import { untrack, type Component } from "svelte";
  import type { ComponentConfig, ControlPanelArgsBuild, MyTopLevelComponentArg, WizardComponentArg } from "./ResizableComponentArg";
  import { activeProfile, ComponentRegistry } from "./ComponentRegistry.svelte";

  let { 
    componentTree, 
    componentOpts = $bindable(),
  }: { 
    componentTree: ComponentConfig<any>
    componentOpts: Record<string, any>
  } = $props();

  let RootComp: Component<any> | undefined = $derived(
    ComponentRegistry.get(activeProfile.profile)?.get(componentTree.component)
  );

  const hydrateLayout = (layout: ComponentConfig<any>, componentConfigurations: Record<string, object>): ComponentConfig<any> => {
    const innerComponentType: string = layout.options.component.component;
    const componentId: string = layout.options.component.compId;
    const innerComponentConfig: ComponentConfig<any> = layout.options.component;

    if (componentConfigurations[componentId]) {
      innerComponentConfig.options = componentConfigurations[componentId];
    }
    
    if (innerComponentType === 'SplitPanel') {
      innerComponentConfig.options.comp1 = hydrateLayout(innerComponentConfig.options.comp1, componentConfigurations);
      innerComponentConfig.options.comp2 = hydrateLayout(innerComponentConfig.options.comp2, componentConfigurations);
    } else if (innerComponentType === 'WizardPanel') {
      innerComponentConfig.options.components.forEach((c: any) => {
        hydrateLayout(c, componentConfigurations)
      })
      
      innerComponentConfig.options.control.options.removeComp = (selected: string) => {
        (innerComponentConfig.options as WizardComponentArg).components = (innerComponentConfig.options as WizardComponentArg).components.filter((c: ComponentConfig<MyTopLevelComponentArg<any>>) => c.options.component.compId !== selected);
      };
      
      innerComponentConfig.options.control.options.swapCompenets = (comp1Index: number, comp2Index: number ) => {
        let tmp: ComponentConfig<MyTopLevelComponentArg<any>> | undefined = (innerComponentConfig.options as WizardComponentArg).components.at(comp1Index);
        if (!tmp) return;
        innerComponentConfig.options.components[comp1Index] = innerComponentConfig.options.components[comp2Index];
        innerComponentConfig.options.components[comp2Index] = tmp

      };
      
    }
    
    return layout; 
  };

  let hydratedLayout: ComponentConfig<any> | undefined = $state();
  $effect(() => {
    hydratedLayout = hydrateLayout(componentTree, componentOpts);
  });
</script>

<main class="w-full h-full">
  {#if hydratedLayout && RootComp}
    <RootComp bind:options={hydratedLayout.options} />
  {/if}
</main>