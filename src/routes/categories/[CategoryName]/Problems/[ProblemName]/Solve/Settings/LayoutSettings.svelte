<script lang="ts">
	import type { DropDownMenuOptions } from "$lib/types/DropDownSelectOptions";
	import type { EditorCompArgs } from "$lib/types/EditorTabCompArgs";
  import type { ComponentConfig as ComponentConfigStatic } from "$lib/types/ComponentConfig";

	import DropDownSelect from "../IdeComponents/HelperComponents/DropDownSelect.svelte";
	import SettingsTile from "./SettingsTile.svelte";
	import { userEditorPreferences } from "$lib/stores/theme.svelte";

  let { options }: { options: EditorCompArgs } = $props();

  const layoutSelectOptions: ComponentConfigStatic<DropDownMenuOptions> = {
    component: DropDownSelect,
    options: {
      label: $state.snapshot(userEditorPreferences.selectedLayout),
      options: Object.keys($state.snapshot(userEditorPreferences.savedLayouts)),
      onSelectCallback: (selected: string) => {
        userEditorPreferences.selectedLayout = selected;
      }
    }
  }
</script>

<main class="w-full h-full px-5">
  <div class="w-full h-[12%]">
		<SettingsTile label={'Layout'} component={layoutSelectOptions}/>
	</div>
</main>