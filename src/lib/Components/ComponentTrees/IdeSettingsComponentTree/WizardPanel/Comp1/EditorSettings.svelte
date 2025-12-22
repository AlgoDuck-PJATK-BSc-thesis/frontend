<script lang="ts">
	import { applyThemeEditor, editorThemes, type EditorThemeName } from '$lib/Themes';
	import { userEditorPreferences } from '$lib/stores/theme.svelte';
	import DropDownSelect2 from '$lib/Components/GenericComponents/dropDownMenu/DropDownSelect2.svelte';
	import SettingSelectionTile, { type SettingSelectionTileArgs } from './SettingSelectionTile.svelte';

	let { options }: { options: {} } = $props();

	let avaliableFontSizes: number[] = [10, 12, 16, 20]; 
</script>

<main class="w-full h-full flex flex-col justify-start items-center px-5">
		<div class="w-full flex flex-row justify-between px-5 py-3">
			<span>Font-size</span>
			<DropDownSelect2 options={{
				options: avaliableFontSizes.map(f => { return { key: {value: `${f}px`} as SettingSelectionTileArgs, value: f}}),
				onSelectCallback: (selected: number) => {
					userEditorPreferences.fontSize = selected;
				},
				displayComp: SettingSelectionTile,
				groupId: "huh"
			}}/>
		</div>
		<div class="w-full flex flex-row justify-between px-5 py-3">
			<span>Editor</span>
		<DropDownSelect2 options={{
			options: Object.keys(editorThemes).map(f => { return { key: {value: f} as SettingSelectionTileArgs, value: f}}),
			onSelectCallback: (selected: string) => {
				userEditorPreferences.theme = selected as EditorThemeName;
				applyThemeEditor(selected as EditorThemeName)
			},
			displayComp: SettingSelectionTile,
			groupId: "huh"
		}}/>
		</div>

</main>
