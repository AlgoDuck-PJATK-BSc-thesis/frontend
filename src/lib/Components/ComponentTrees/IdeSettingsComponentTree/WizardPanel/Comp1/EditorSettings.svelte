<script lang="ts">
	import { applyThemeEditor, editorThemes, type EditorThemeName } from '$lib/Themes';
	import type { ComponentConfig } from '$lib/types/ComponentConfig';

	import { userEditorPreferences } from '$lib/stores/theme.svelte';
	import DropDownSelect from '$lib/Components/GenericComponents/dropDownMenu/DropDownSelect.svelte';
	import type { DropDownMenuOptions } from '$lib/Components/GenericComponents/dropDownMenu/DropDownSelectOptions';
	import SettingsTile from '../../SettingsTile.svelte';

	let { options }: { options: {} } = $props();

	let avaliableFontSizes: number[] = [10, 12, 16, 20]; 
	const fontSizeSelectOptions: ComponentConfig<DropDownMenuOptions<string, number>> = {
		component: DropDownSelect,
		options: {
			options: avaliableFontSizes.map(f => {return {key: `${f}px`, value: f}}),
			onSelectCallback: (selected: number) => {
				userEditorPreferences.fontSize = selected;
			},
			groupId: "huh"
		}
	};

	const themeSelectOptions: ComponentConfig<DropDownMenuOptions<string, EditorThemeName>> = {
		component: DropDownSelect,
		options: {
			options: Object.keys(editorThemes).map(t => {return { key: t, value: t as EditorThemeName}}),
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
