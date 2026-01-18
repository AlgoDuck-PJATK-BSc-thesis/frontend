<script lang="ts">
	import ComponentTreeRenderer from '$lib/Components/GenericComponents/layoutManager/ComponentTreeRenderer.svelte';
	import layout from "$lib/Components/ComponentTrees/IdeSettingsComponentTree/layout.json"
	import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';

	let {
		isSettingsPanelShown = $bindable()
	}: {isSettingsPanelShown: boolean } = $props();


	const toggleSettingsPanel = (): void => {
		isSettingsPanelShown = false;
	};

	const handleBackdropClick = (event: MouseEvent): void => {
		if (event.target === event.currentTarget) {
			toggleSettingsPanel();
		}
	};

	let config = $state<Record<string, object>>({
		"editor-settings": {}
	})

</script>

<div class="w-full h-full flex bg-ide-dcard/10 backdrop-blur-sm justify-center items-center z-100 fixed left-0 top-0" onclick={handleBackdropClick} onkeydown={toggleSettingsPanel} role="button" tabindex="0">
	<div class="w-[45%] h-[50%] flex flex-col bg-ide-dcard justify-start items-center rounded-xl overflow-hidden border-2 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]">
		<div class="w-full h-12 flex bg-ide-card justify-end items-center px-[1.5%]">
			<button class="h-[60%] aspect-square hover:bg-ide-dcard rounded-[20%] duration-300 transition-colors ease-out" onclick={toggleSettingsPanel}>
				<CrossIconSvg options={{ class:"stroke-ide-text-primary w-full h-full" }}/>
			</button>
		</div>
		<div class="w-full grow">
			<ComponentTreeRenderer componentTree={layout} componentOpts={config}/>
		</div>
	</div>
</div>