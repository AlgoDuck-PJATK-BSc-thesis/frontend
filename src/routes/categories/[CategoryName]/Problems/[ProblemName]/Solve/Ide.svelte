<script lang="ts">
	import SettingsPanel from './Settings/SettingsPanel.svelte';
	import TopPanel from './IdeComponents/TopPanel.svelte';

	import { type Component } from 'svelte';
	import { activeProfile, ComponentRegistry } from './editor/ComponentRegistry.svelte';
	import type { ComponentConfig, ComponentType } from './editor/ResizableComponentArg';
	import { userEditorPreferences } from '$lib/stores/theme.svelte';

	let { components = $bindable() }: { components: Record<string, object> } = $props();
	
	let isExecutingCode: boolean = $state(false);
	let isSettingsPanelShown = $state(false);

	let rootCompType: ComponentType = $state('TopLevelComponent');
	
	let RootComp: Component<any> = $derived(ComponentRegistry.get(activeProfile.profile)!.get(rootCompType)!);

	const hydrateLayout = (layout: ComponentConfig<any>, componentConfigurations: Record<string, object>): ComponentConfig<any> => {
 	 const node = { ...layout };

		const innerComponentType: ComponentType = node.options.component.component;
		const innerComponentCongig: ComponentConfig<any> = node.options.component;
  	if (componentConfigurations[innerComponentType]){
			innerComponentCongig.options = componentConfigurations[innerComponentType];	
		} 

  	if (innerComponentType === 'SplitPanel') {
  	  innerComponentCongig.options = {
				...innerComponentCongig.options,
  	    comp1: hydrateLayout(innerComponentCongig.options.comp1, componentConfigurations),
  	    comp2: hydrateLayout(innerComponentCongig.options.comp2, componentConfigurations),
  	  };
  	} else if (innerComponentType === 'WizardPanel') {
  	  node.options.component.options = {
				...innerComponentCongig.options,
  	    components: innerComponentCongig.options.components.map((c: any) =>
  	      hydrateLayout(c, componentConfigurations)
  	    ),
  	  };
  	}

	  return node;
	}

	let hydratedLayout = $state<ComponentConfig<any>>();

	$effect(() => {
	  const layout = userEditorPreferences.savedLayouts[userEditorPreferences.selectedLayout];
	  if (layout) {
	    hydratedLayout = hydrateLayout(JSON.parse(layout), components);
	  }
	});

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
  {#if hydratedLayout}
		<RootComp bind:options={hydratedLayout.options}/>
  {/if}
</div>
</main>
