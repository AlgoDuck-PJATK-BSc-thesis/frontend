<script lang="ts" generics="T extends {}">
  import type { Component } from "svelte";
  import type { ComponentConfig, ComponentType } from "./ResizableComponentArg";
  import { ComponentRegistry } from "./ComponentRegistry";
 
  let { options = $bindable() }: { options: { component: ComponentConfig<T> } } = $props();
  
  const Inner: Component<{ options: T }> | undefined = $derived(
    options?.component ? ComponentRegistry.get(options.component.component) as Component<{ options: T }> : undefined
  );
  let innerOptions: T | undefined = $derived(options?.component?.options);
</script>

{#if options?.component && Inner && innerOptions}
<div bind:this={options.component.contentWrapper} class="w-full h-full">
  <Inner bind:options={innerOptions} />
</div>
{/if}