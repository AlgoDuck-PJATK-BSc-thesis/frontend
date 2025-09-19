<script lang="ts">
	import { applyThemeEditor, editorThemes, type EditorThemeName } from '$lib/Themes';
	import type { ComponentConfig } from '$lib/types/ComponentConfig';
	import type { DropDownMenuOptions } from '$lib/types/DropDownSelectOptions';
	import type { EditorCompArgs } from '$lib/types/EditorTabCompArgs';
	import { userEditorFontSizePreferences, userEditorThemePreferences } from '../../../../../../Stores';
	import DropDownSelect from './DropDownSelect.svelte';


	let { options }: { options: EditorCompArgs } = $props();


	let fontSize: number = $state(16);
	let editorTheme: EditorThemeName = $state('vs-dark'); 

	userEditorThemePreferences.subscribe((pref) => {
		editorTheme = pref.editorTheme;
	});

	userEditorFontSizePreferences.subscribe((pref) => {
		fontSize = pref.fontSize;
	});

const fontSizeSelectOptions: ComponentConfig<DropDownMenuOptions> = {
		component: DropDownSelect,
			// svelte-ignore state_referenced_locally
			// intentional init only state capture as DropDownMenu handles it's own label changes after initial render
		options: {
			label: `${fontSize}px`,
			options: ['10px', '12px', '16px', '20px'],
			onSelectCallback: (selected: string) => {
				userEditorFontSizePreferences.set({fontSize: parseInt(selected.replaceAll('px', ''))})
			}
		}
	};

	const themeSelectOptions: ComponentConfig<DropDownMenuOptions> = {
		component: DropDownSelect,
			// svelte-ignore state_referenced_locally
			// intentional init only state capture as DropDownMenu handles it's own label changes after initial render
		options: {
			label: editorTheme,
			options: Object.keys(editorThemes),
			onSelectCallback: (selected: string) => {
				userEditorThemePreferences.set({editorTheme: selected as EditorThemeName});
				applyThemeEditor(selected as EditorThemeName)
			}
		}
	};
</script>

<main class="w-full h-full flex flex-col justify-start items-center px-5">
	{@render SettingTile('Font-size', fontSizeSelectOptions)}
	{@render SettingTile('Theme', themeSelectOptions)}
	<!-- frankly this is pathological standarization but I lowk fw it -->
</main>

{#snippet SettingTile(label: string, component: ComponentConfig<DropDownMenuOptions>)}
	{@const Component = component.component}
	{@const options = component.options}
	<div class="w-full h-[12%] flex justify-between items-center">
		<span class="text-xl text-ide-text-secondary">{label}</span>
		<div class="w-[20%] h-[80%] rounded-md relative">
			<Component {options} />
		</div>
	</div>
{/snippet}
