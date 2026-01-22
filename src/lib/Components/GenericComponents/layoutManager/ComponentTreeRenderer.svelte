<script lang="ts">
	import type { Component } from 'svelte';
	import type {
		ComponentConfig,
		ControlPanelArgs,
		MyTopLevelComponentArg,
		ResizeableComponentArg,
		WizardComponentArg
	} from './ResizableComponentArg';
	import { activeProfile, ComponentRegistry, LayoutComponents } from './ComponentRegistry.svelte';

	let {
		componentTree,
		componentOpts = $bindable(),
		contextInjectors
	}: {
		componentTree: ComponentConfig<any>;
		componentOpts: Record<string, any>;
		contextInjectors?: Record<string, (options: any) => void>;
	} = $props();

	let RootComp: Component<any> | undefined = $derived(
		ComponentRegistry.get(activeProfile.profile)?.get(componentTree.component)
	);
	const hydrateLayout = (
		layout: ComponentConfig<MyTopLevelComponentArg<any>>,
		componentConfigurations: Record<string, object>
	): ComponentConfig<any> => {
		const innerComponentType: string | undefined =
			layout?.options?.component?.component ?? layout?.component;
		const componentId: string | undefined = layout?.options?.component?.compId ?? layout?.compId;

		const innerComponentConfig: ComponentConfig<any> | undefined =
			layout?.options?.component ?? layout;

		if (componentConfigurations[componentId]) {
			const tmp = innerComponentConfig.options;
			innerComponentConfig.options = componentConfigurations[componentId];
			Object.entries(tmp).forEach(([k, v]) => {
				if (innerComponentConfig.options[k] === undefined) {
					innerComponentConfig.options[k] = v;
				}
			});
		} else if (!LayoutComponents.some((c) => c === innerComponentType)) {
			componentConfigurations[componentId] = innerComponentConfig.options;
		}

		if ((contextInjectors ?? {})[innerComponentType] !== undefined) {
			contextInjectors![innerComponentType]!(innerComponentConfig.options);
		}

		if (innerComponentType === 'SplitPanel') {
			(
				innerComponentConfig as ComponentConfig<
					ResizeableComponentArg<MyTopLevelComponentArg<any>, MyTopLevelComponentArg<any>>
				>
			).options.comp1 = hydrateLayout(innerComponentConfig.options.comp1, componentConfigurations);
			(
				innerComponentConfig as ComponentConfig<
					ResizeableComponentArg<MyTopLevelComponentArg<any>, MyTopLevelComponentArg<any>>
				>
			).options.comp2 = hydrateLayout(innerComponentConfig.options.comp2, componentConfigurations);
		} else if (
			innerComponentType === 'WizardPanel' ||
			innerComponentType === 'TerminalWizardPanel'
		) {
			if (
				(contextInjectors ?? {})[
					(innerComponentConfig.options as WizardComponentArg).control.component
				]
			) {
				contextInjectors![(innerComponentConfig.options as WizardComponentArg).control.component](
					(innerComponentConfig.options as WizardComponentArg).control.options
				);
			}
			(innerComponentConfig as ComponentConfig<WizardComponentArg>).options.components.forEach(
				(c: any) => {
					hydrateLayout(c, componentConfigurations);
				}
			);
		}

		return layout;
	};

	let lastTreeId = $state<string>();
	let lastOptsSnapshot = $state<string>();

	let hydratedLayout: ComponentConfig<any> | undefined = $state();

	$effect(() => {
		const currentTreeId = componentTree.compId;
		const currentOptsSnapshot = JSON.stringify(Object.keys(componentOpts));

		if (currentTreeId !== lastTreeId || currentOptsSnapshot !== lastOptsSnapshot) {
			hydratedLayout = hydrateLayout(componentTree, componentOpts);
			lastTreeId = currentTreeId;
			lastOptsSnapshot = currentOptsSnapshot;
		}
	});
</script>

<main class="h-full w-full">
	{#if hydratedLayout && RootComp}
		<RootComp bind:options={hydratedLayout.options} />
	{/if}
</main>
