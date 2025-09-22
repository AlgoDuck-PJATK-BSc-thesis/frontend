<script lang="ts">
	import type { DropDownMenuOptions } from "$lib/types/DropDownSelectOptions";
	import type { EditorCompArgs } from "$lib/types/EditorTabCompArgs";
	import { userEditorLayoutChosenPreference, userEditorLayoutPreferences } from "../../../../../../../Stores";
	import type { ComponentConfig } from "../../../../../../editor/ResizableComponentArg";
  import type { ComponentConfig as ComponentConfigStatic } from "$lib/types/ComponentConfig";

	import DropDownSelect from "../IdeComponents/HelperComponents/DropDownSelect.svelte";

  let { options }: { options: EditorCompArgs } = $props();

  let editorLayouts: Map<string, ComponentConfig<any>> = $state(new Map<string, ComponentConfig<any>>());
  let selectedLayout: ComponentConfig<any> | undefined = $derived(editorLayouts.get('default'));


  $inspect(editorLayouts);

  userEditorLayoutPreferences.subscribe((pref) => {
    pref.layouts.forEach((v, k) => {
      editorLayouts.set(k, v);
    })
	});
  userEditorLayoutChosenPreference.subscribe((pref)=>{
    selectedLayout = pref.layout
  });

  const layoutSelectOptions: ComponentConfigStatic<DropDownMenuOptions> = {
    component: DropDownSelect,
    options: {
      label: selectedLayout!.layoutId!,
      options: [...availableLayouts.map(lay => lay.layoutId)],
      onSelectCallback: (selected: string) => {
        userEditorLayoutChosenPreference.set({layout: availableLayouts[availableLayouts.findIndex((lay) => lay.layoutId === selected)]});
      }
    }
  }

  $inspect(availableLayouts);

</script>

<main class="w-full h-full px-5">
  {@render SettingTile('Layout', layoutSelectOptions)}
</main>

{#snippet SettingTile(label: string, component: ComponentConfigStatic<DropDownMenuOptions>)}
	{@const Component = component.component}
	{@const options = component.options}
	<div class="w-full h-[12%] flex justify-between items-center">
		<span class="text-xl text-ide-text-secondary">{label}</span>
		<div class="w-[20%] h-[80%] rounded-md relative">
			<Component {options} />
		</div>
	</div>
{/snippet}

