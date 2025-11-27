<script lang="ts" generics="K, V">
	import type { DropDownMenuOptions } from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelectOptions";
  import type { ComponentConfig as ComponentConfigStatic } from "$lib/types/ComponentConfig";
	import type { Component } from "svelte";

  let { label, component }: {label: string, component: ComponentConfigStatic<DropDownMenuOptions<K, V>>} = $props();

  let Comp: Component<{ options: DropDownMenuOptions<K, V> }> = $derived(component.component);
  let options: DropDownMenuOptions<K, V> = $derived(component.options);
</script>

<main class="w-full h-full flex justify-between items-center">
  <span class="text-xl text-ide-text-secondary">{label}</span>
  <div class="w-[20%] h-[80%] rounded-md relative">
    <Comp {options} />
  </div>
</main>