<script lang="ts">
	import { page } from '$app/state';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import HeaderUser from '$lib/Components/Headers/HeaderUser.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import type { EditorConfigData } from './categories/problems/solve/types';
	import { toast } from '$lib/Components/Notifications/ToastStore.svelte';
	import { userEditorPreferences } from '$lib/stores/theme.svelte';
	import { applyThemeEditor, type EditorThemeName } from '$lib/Themes';

	let { children } = $props();

	let hideHeader = $derived(page.data.hideHeader);

	let query = createQuery({
		queryKey: [ "config" ],
		queryFn: async () => {
			try{
				let res: StandardResponseDto<EditorConfigData> = await FetchFromApi<EditorConfigData>("user/preferences/editor", {
					method: "GET"
				}, fetch);
				console.log(res);
				userEditorPreferences.layout = res.body.layout;
				userEditorPreferences.fontSize = res.body.fontSize;
				userEditorPreferences.theme = res.body.theme;
				console.log(userEditorPreferences.theme.themeName);
				return res;
			}catch(err){
				toast.warning('failed loading editor config. Falling back to default');
			}
		}
	});

	$query.refetch();
</script>

<main class="w-full h-full flex flex-col">
	{#if !hideHeader}
		<HeaderUser />
	{/if}
	
	<div class="font-body flex h-full flex-col bg-bg text-text transition-colors duration-300">
		{@render children?.()}
	</div>
</main>
