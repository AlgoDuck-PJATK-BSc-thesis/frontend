<script lang="ts" generics="T extends LayoutManagerComponentArgs">
  import type { Component } from "svelte";
  import type { ComponentConfig, LayoutManagerComponentArgs } from "./ResizableComponentArg";
  import { activeProfile, ComponentRegistry } from "./ComponentRegistry.svelte";
 
  let { options = $bindable() }: { options: { component: ComponentConfig<T> } } = $props();
  
  const registryProfileAtInitialRender: string = $state.snapshot(activeProfile.profile);

  const Inner: Component<{ options: T }> | undefined = $derived(
    options?.component ? ComponentRegistry.get(registryProfileAtInitialRender)!.get(options.component.component) as Component<{ options: T }> : undefined
  );

  if (options.component.compId === "root"){
    $inspect(options)

  }
  // console.log(options.component.compId);

  let innerOptions: T | undefined = $derived(options?.component?.options);
</script>

{#if options?.component && Inner && innerOptions}
  <div bind:this={options.component.contentWrapper} class="w-full h-full overflow-hidden rounded-xl">
    <Inner bind:options={innerOptions} />
  </div>
{/if}