<script lang="ts">
  import type { Component } from "svelte";
  import type { ComponentConfig } from "./ResizableComponentArg";
  import { activeProfile, ComponentRegistry } from "./ComponentRegistry.svelte";

  let { componentTree, componentOpts = $bindable() }: { 
    componentTree: ComponentConfig<any>
    componentOpts: Record<string, any> 
  } = $props();

  let RootComp: Component<any> | undefined = ComponentRegistry.get(activeProfile.profile)?.get(componentTree.component);

  const hydrateLayout = (layout: ComponentConfig<any>, componentConfigurations: Record<string, object>): ComponentConfig<any> => {
    const innerComponentType: string = layout.options.component.component;
    const componentId: string = layout.options.component.compId;
    const innerComponentConfig: ComponentConfig<any> = layout.options.component;

    if (componentConfigurations[componentId]) {
      Object.assign(innerComponentConfig.options, componentConfigurations[componentId]);
    }

    if (innerComponentType === 'SplitPanel') {
      innerComponentConfig.options.comp1 = hydrateLayout(innerComponentConfig.options.comp1, componentConfigurations);
      innerComponentConfig.options.comp2 = hydrateLayout(innerComponentConfig.options.comp2, componentConfigurations);
    } else if (innerComponentType === 'WizardPanel') {
      innerComponentConfig.options.components = innerComponentConfig.options.components.map((c: any) =>
        hydrateLayout(c, componentConfigurations)
      );
    }

    return layout; 
  };

  let hydratedLayout: ComponentConfig<any> | undefined = $state();

  $effect(() => {
    const opts = componentOpts;
    hydratedLayout = hydrateLayout(componentTree, opts);
  });
</script>

<main class="w-full h-full">
  {#if hydratedLayout && RootComp}
    <RootComp bind:options={hydratedLayout.options} />
  {/if}
</main>