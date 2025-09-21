<script lang="ts">
	import type { TabConfig } from '$lib/types/TabConfig';
	import EditorSettings from './EditorSettings.svelte';
	import EditorIconSvg from '$lib/svg/EditorComponentIcons/EditorIconSvg.svelte';
	import Cross from '$lib/svg/cross.svelte';
	import LayoutIconSvg from '$lib/svg/LayoutIconSvg.svelte';
	import LayoutSettings from './LayoutSettings.svelte';

	let {
		isSettingsPanelShown = $bindable()
	}: {isSettingsPanelShown: boolean } = $props();

	const tabs: TabConfig<{}>[] = [
		{
			id: 'editor',
			label: 'Editor',
			icon: {
				component: EditorIconSvg,
				options: {
					color: '#9290C3'
				}
			},
			comp: {
				component: EditorSettings,
				options: {}
			}
		},
		{
			id: 'layout',
			label: 'Layouts',
			icon: {
				component: LayoutIconSvg,
				options: {
					color: '#9290C3'
				}
			},
			comp: {
				component: LayoutSettings,
				options: {}
			}
		}
	];

	const toggleSettingsPanel = (): void => {
		isSettingsPanelShown = false;
	};

	const handleBackdropClick = (event: MouseEvent): void => {
		if (event.target === event.currentTarget) {
			toggleSettingsPanel();
		}
	};

	let activeTabId: string = $state('editor');
	const activeTab = $derived(tabs.find((tab) => tab.id === activeTabId) || tabs[0]);
	const ActiveComponent = $derived(activeTab.comp.component);
	const activeComponentOptions = $derived(activeTab.comp.options);
</script>

<div
	class="w-full h-full flex bg-ide-dcard/10 backdrop-blur-sm justify-center items-center z-100 fixed left-0 top-0"
	onclick={handleBackdropClick}
	onkeydown={toggleSettingsPanel}
	role="button"
	tabindex="0"
>
	<div
		class="w-[45%] h-[50%] bg-ide-dcard flex justify-center rounded-xl overflow-hidden border-2 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]"
	>
		<div class="h-full w-[25%] bg-ide-card flex flex-col justify-start">
			<h3 class="w-full h-[10%] px-4 py-1 text-ide-text-secondary text-2xl my-4 select-none">
				Settings
			</h3>
			<div class="w-full h-[90%] flex flex-col justify-start items-center px-3">
				{#each tabs as tab}
					{@render TabButton(tab)}
				{/each}
			</div>
		</div>

		<div class="h-full w-[75%] relative">
			<div class="h-[12%] flex justify-end items-center px-[2%]">
				<button class="h-[25%] aspect-square hover:cursor-pointer" onclick={toggleSettingsPanel}>
					<Cross args={{ color: '#FFFFFF' }} />
				</button>
			</div>
			<div class="h-[90%]">
				<ActiveComponent options={activeComponentOptions} />
			</div>
		</div>
	</div>
</div>

{#snippet TabButton<P extends {}>(tab: TabConfig<P>)}
	{@const Icon = tab.icon.component}
	<button
		class="w-full h-[15%] flex justify-center items-center py-[2.5%] px-[10%] rounded-lg hover:cursor-pointer hover:bg-ide-dcard mb-1.5 {activeTabId ===
		tab.id
			? 'bg-ide-dcard'
			: ''}"
		onclick={() => (activeTabId = tab.id)}
	>
		<Icon options={{color: '#ffffff'}}/>
		<span class="flex justify-center flex-grow items-center text-xl select-none text-ide-text-primary">
			{tab.label}
		</span>
	</button>
{/snippet}
