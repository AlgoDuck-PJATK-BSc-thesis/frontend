<script lang="ts">
	import TopPanel from './IdeComponents/TopPanel.svelte';
	import DefaultLayout from '$lib/Components/ComponentTrees/IdeComponentTree/default-layout.json'
	import ComponentTreeRenderer from '$lib/Components/GenericComponents/layoutManager/ComponentTreeRenderer.svelte';
	import SettingsPanel from './Settings/SettingsPanel.svelte';

	let { components = $bindable() }: { components: Record<string, object> } = $props();
	
	let isExecutingCode: boolean = $state(false);
	let isSettingsPanelShown = $state(false);

	const executeCode = (): void => {
		isExecutingCode = true;
	}

	const submitCode = (): void => {
		isExecutingCode = true;
	}
</script>

<main class="w-full h-[100vh] flex flex-col">
	{#if isSettingsPanelShown}
		<SettingsPanel bind:isSettingsPanelShown />
	{/if}

	<div class="w-full h-[5%]">
		<TopPanel
			executeCallback={executeCode}
			submitCallback={submitCode}
			isExecuting={isExecutingCode}
			bind:isSettingsPanelShown
		/>
	</div>

	<div class="w-full h-[95%] flex p-[0.5%]">
		<ComponentTreeRenderer componentTree={DefaultLayout} bind:componentOpts={components}/>
	</div>
</main>
