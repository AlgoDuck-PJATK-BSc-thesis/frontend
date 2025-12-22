<script lang="ts" generics="K extends Record<string, any>, V">
	import type { DropDownMenuOptions, DropDownMenuOptions2 } from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelectOptions";
  import type { ComponentConfig as ComponentConfigStatic } from "$lib/types/ComponentConfig";
	import type { Component } from "svelte";

  let { label, component }: {label: string, component: ComponentConfigStatic<DropDownMenuOptions2<K, V>>} = $props();

  let Comp: Component<{ options: DropDownMenuOptions2<K, V> }> = $derived(component.component);
  let options: DropDownMenuOptions2<K, V> = $derived(component.options);
</script>

<main class="w-full h-full flex justify-between items-center">
  <span class="text-xl text-ide-text-secondary">{label}</span>
  <Comp {options} />
</main>