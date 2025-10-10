<script lang="ts">
	import { applyThemeEditor, editorThemes, type EditorThemeName } from '$lib/Themes';
	import type { ComponentConfig } from '$lib/types/ComponentConfig';
	import type { DropDownMenuOptions } from '$lib/types/DropDownSelectOptions';
	import type { EditorCompArgs } from '$lib/types/EditorTabCompArgs';
	import DropDownSelect from '../IdeComponents/HelperComponents/DropDownSelect.svelte';
	import SettingsTile from './SettingsTile.svelte';

	import { userEditorPreferences } from '$lib/stores/theme.svelte';

	let { options }: { options: EditorCompArgs } = $props();

const fontSizeSelectOptions: ComponentConfig<DropDownMenuOptions> = {
		component: DropDownSelect,
		options: {
			label: `${$state.snapshot(userEditorPreferences.fontSize)}px`,
			options: ['10px', '12px', '16px', '20px'],
			onSelectCallback: (selected: string) => {
				userEditorPreferences.fontSize = parseInt(selected.replaceAll('px', ''));
			},
			groupId: "huh"
		}
	};

	const themeSelectOptions: ComponentConfig<DropDownMenuOptions> = {
		component: DropDownSelect,
		options: {
			label: $state.snapshot(userEditorPreferences.theme),
			options: Object.keys(editorThemes),
			onSelectCallback: (selected: string) => {
				userEditorPreferences.theme = selected as EditorThemeName;
				applyThemeEditor(selected as EditorThemeName)
			},
			groupId: "huh"

		}
	};
</script>

<main class="w-full h-full flex flex-col justify-start items-center px-5">
	<div class="w-full h-[12%]">
		<SettingsTile label={'Font-size'} component={fontSizeSelectOptions}/>
	</div>
	<div class="w-full h-[12%]">
		<SettingsTile label={'Theme'} component={themeSelectOptions}/>
	</div>
</main>
