<script lang="ts">
	import DropDownSelect from './dropDownSelect.svelte';

	import type { DropDownMenuOptions } from './Types/DropDownSelectOptions';
	import type { EditorCompArgs } from './Types/EditorTabCompArgs';
	import type { ComponentConfig } from './Types/ComponentConfig';

	let { options }: { options: EditorCompArgs } = $props();

	const fontSizeSelectOptions: ComponentConfig<DropDownMenuOptions> = {
		component: DropDownSelect,
		options: {
			label: `${options.getCurrFontSize()}px`,
			options: ['10px', '12px', '16px', '20px'],
			onSelectCallback: (selected: string) => {
				options.setFontCallback(parseInt(selected.replaceAll('px', '')));
			}
		}
	};

	const themeSelectOptions: ComponentConfig<DropDownMenuOptions> = {
		component: DropDownSelect,
		options: {
			label: options.getCurrTheme(),
			options: ['vs', 'vs-dark', 'dracula'],
			onSelectCallback: (selected: string) => {
				options.setThemeCallback(selected);
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
	<div class="w-full h-[12%] flex z-300 justify-between items-center">
		<span class="text-xl text-text-secondary">{label}</span>
		<div class="w-[20%] h-[80%] rounded-md relative">
			<Component {options} />
		</div>
	</div>
{/snippet}
