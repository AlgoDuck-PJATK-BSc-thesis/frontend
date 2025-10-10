<script lang="ts">
  import type { ComponentConfig as ComponentConfigStatic } from "$lib/types/ComponentConfig";
	import type { DropDownMenuOptions } from "$lib/types/DropDownSelectOptions";
	import type { Component } from "svelte";

  let { label, component }: {label: string, component: ComponentConfigStatic<DropDownMenuOptions>} = $props();

  let Comp: Component<{ options: DropDownMenuOptions }> = $derived(component.component);
  let options: DropDownMenuOptions = $derived(component.options);
</script>

<main class="w-full h-full flex justify-between items-center">
  <span class="text-xl text-ide-text-secondary">{label}</span>
  <div class="w-[20%] h-[80%] rounded-md relative">
    <Comp {options} />
  </div>
</main>