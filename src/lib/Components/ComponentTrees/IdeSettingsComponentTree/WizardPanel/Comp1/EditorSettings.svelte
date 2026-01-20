<script lang="ts">
	import { applyThemeEditor, editorThemes, type EditorThemeName } from '$lib/Themes';
	import { userEditorPreferences, userThemePreference } from '$lib/stores/theme.svelte';
	import DropDownSelect2 from '$lib/Components/GenericComponents/dropDownMenu/DropDownSelect2.svelte';
	import SettingSelectionTile, { type SettingSelectionTileArgs } from './SettingSelectionTile.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { FetchFromApi } from '$lib/api/apiCall';
	import type { EditorThemeDto } from '../../../../../../routes/(authenticated)/(user)/categories/problems/solve/types';
	import { toast } from '$lib/Components/Notifications/ToastStore.svelte';

	let { options }: { options: {} } = $props();

	let avaliableFontSizes: number[] = [10, 12, 16, 20, 24, 28, 32]; 

	const editorUpdateDebounceTime: number = 2500;

	const themeQuery = createQuery({
		queryKey: ["editor", "themes"],
		queryFn: async () => {
			return await FetchFromApi<EditorThemeDto[]>("problem/editor/theme", {
				method: "GET"
			})
		}
	});


	const updateEditorPreferences = async () => {
		const capturedTheme: EditorThemeDto = userEditorPreferences.theme;
		const capturedFontSize: number = userEditorPreferences.fontSize;
		await FetchFromApi("problem/editor/theme", {
			method: "PATCH",
			body: JSON.stringify({
				fontSize: capturedFontSize,
				themeId: capturedTheme.themeId
			})
		})
	}
	
	let currentUpdateTimeout: NodeJS.Timeout | undefined;
</script>

<main class="w-full h-full flex flex-col justify-start items-center px-5">
		<div class="w-full flex text-lg flex-row items-center justify-between px-5 py-3">
			<span>Font-size</span>
				<DropDownSelect2 options={{
					options: avaliableFontSizes.map(f => { return { key: { value: `${f}px` } as SettingSelectionTileArgs, value: f}}),
					onSelectCallback: (selected: number) => {
						if (currentUpdateTimeout) 
							clearTimeout(currentUpdateTimeout);

						currentUpdateTimeout = setTimeout(async () => {
							try{
								await updateEditorPreferences();
							}catch(err){
								toast.error(`failed persisting editor preferences.\nReason: ${err}`)
							}
						}, editorUpdateDebounceTime)
						userEditorPreferences.fontSize = selected;
					},
					displayComp: SettingSelectionTile,
					groupId: "huh"
				}}/>
		</div>
		<div class="w-full flex text-lg flex-row items-center justify-between px-5 py-3">
			<span>Editor</span>
			{#if $themeQuery.isLoading}
				<div class="w-50 h-12 px-1 py-0.5 bg-ide-card flex justify-center gap-2 items-center">
					<div class="w-5 h-5 border-t-3 border-t-ide-text-secondary rounded-full animate-spin"></div>
					<span>Loading themes...</span>
				</div>
			{:else if $themeQuery.data}
				<DropDownSelect2 options={{
					options: $themeQuery.data.body.map(f => { return { key: { value: f.themeName }, value: f}}),
					onSelectCallback: (selected: EditorThemeDto) => {
						userEditorPreferences.theme = selected;
						applyThemeEditor(userEditorPreferences.theme.themeName as EditorThemeName)

						if (currentUpdateTimeout) 
							clearTimeout(currentUpdateTimeout);

						currentUpdateTimeout = setTimeout(async () => {
							try{
								await updateEditorPreferences();
							}catch(err){
								toast.error(`failed persisting editor preferences.\nReason: ${err}`)
							}
						}, editorUpdateDebounceTime)
					},
					displayComp: SettingSelectionTile,
					groupId: "huh"
				}}/>
			{/if}

		</div>
</main>