<script lang="ts">
	import type { DropDownMenuOptions } from "$lib/types/DropDownSelectOptions";
	import type { EditorCompArgs } from "$lib/types/EditorTabCompArgs";
  import type { ComponentConfig as ComponentConfigStatic } from "$lib/types/ComponentConfig";

	import DropDownSelect from "../IdeComponents/HelperComponents/DropDownSelect.svelte";
	import { loadLayouts, userEditorLayoutChosenPreference } from "$lib/stores/theme";

  let { options }: { options: EditorCompArgs } = $props();

  let selectedLayout: string = $state("default");

  userEditorLayoutChosenPreference.subscribe(pref => {
    selectedLayout = pref.layoutId;
  });

  let availableLayouts: Record<string, string> = $state(loadLayouts());

  const layoutSelectOptions: ComponentConfigStatic<DropDownMenuOptions> = {
    component: DropDownSelect,
    options: {
      // svelte-ignore state_referenced_locally
      label: $state.snapshot(selectedLayout),
      options: Object.keys(availableLayouts),
      onSelectCallback: (selected: string) => {
        userEditorLayoutChosenPreference.set({layoutId: selected});
      }
    }
  }

  // $inspect(availableLayouts);

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

