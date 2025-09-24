<script lang="ts">
	import SettingsPanel from './Settings/SettingsPanel.svelte';
	import TopPanel from './IdeComponents/TopPanel.svelte';

	import { ComponentRegistry } from '../../../../../editor/ComponentRegistry';
	
	import type { ComponentConfig, ComponentType } from '../../../../../editor/ResizableComponentArg';
	import type { Component } from 'svelte';
	import { loadLayouts, userEditorLayoutChosenPreference, userEditorLayoutPreferences } from '$lib/stores/theme';

	let { components = $bindable() }: { components: Record<string, object> } = $props();
	
	let availableLayouts: Record<string, string> = $state(loadLayouts());

	$inspect(components);
	
	userEditorLayoutPreferences.subscribe( pref => {
		availableLayouts = pref.layouts;
	});
	
	let selectedLayout: string = $state('default');

	userEditorLayoutChosenPreference.subscribe(pref => {
		selectedLayout = pref.layoutId
	});

	let isExecutingCode: boolean = $state(false);
	let isSettingsPanelShown = $state(false);

	let rootCompType: ComponentType = $state('TopLevelComponent');
  let RootComp: Component<any> = $derived(ComponentRegistry.get(rootCompType)!);

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

	let hydratedLayout: ComponentConfig<any> | undefined = $state();

	$effect(() => {
	  const baseLayout = availableLayouts[selectedLayout];
	  if (baseLayout) {
	    hydratedLayout = hydrateLayout(JSON.parse(baseLayout) as ComponentConfig<any>, components);
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
    {#key selectedLayout}
      <RootComp bind:options={hydratedLayout.options}/>
    {/key}
  {/if}
</div>
</main>
