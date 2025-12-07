<script lang="ts">
	import { onDestroy, onMount, type Component, type Snippet } from "svelte";
	import type { svgArg } from "$lib/types/SvgIcon";
	import { activeProfile, ComponentRegistry } from "$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte";
	import type { ComponentConfig, ControlPanelArgs, MyTopLevelComponentArg, ResizeAxis, tabSide, WizardComponentArg } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
	import ComponentTreeRenderer from "$lib/Components/GenericComponents/layoutManager/ComponentTreeRenderer.svelte";
	import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";

	type Coords = { x: number; y: number };

	let { registeredComponents }: { registeredComponents: ComponentConfig<any>[] } = $props();

	let wizardPipPosition: number = $state(0);
	let componentIdCounter: number = $state(0);

	onMount(() => {
		activeProfile.profile = 'builder'
	})

	onDestroy(() => {
		activeProfile.profile = 'default';
	});

	const generateId = (prefix: string): string => {
		return `${prefix}-${Date.now()}-${componentIdCounter++}`;
	};

	const saveTree = (): void => {
		let toBeExplored: ComponentConfig<any>[] = [componentTree];
		while (toBeExplored.length > 0) {
			const frontier: ComponentConfig<any>[] = [];

			for (const cc of toBeExplored) {
				cc.contentWrapper = undefined;
				const nodeStripped: ComponentConfig<any> = cc.options.component;
				nodeStripped.contentWrapper = undefined;
				if (nodeStripped.component === "WizardPanel") {
					nodeStripped.options.componentsContainer = undefined;
					frontier.push(...nodeStripped.options.components);
				} else if (nodeStripped.component === "SplitPanel") {
					frontier.push(nodeStripped.options.comp1, nodeStripped.options.comp2);
				}
			}

			toBeExplored = frontier;
		}

		const layoutName = `layout-${Date.now()}`;
    console.log(JSON.stringify(componentTree));
	};

	let isResizablePipRotated: boolean = $state(false);

	type draggingData = {
		isDragging: boolean;
		draggedButton: HTMLButtonElement;
		initCoords: { x: number; y: number } ;
		compData: ComponentConfig<any>;
	};

	let lastMouseX: number | null = null;
	let lastMouseY: number | null = null;

	let dragging: draggingData = $state({} as draggingData);

	const DEFAULT_SIZE = { w: 160, h: 96 };


	const handleMouseDown = (button: HTMLButtonElement, comp: ComponentConfig<any>) => {
		const rect = button.getBoundingClientRect();
		const w = rect.width || DEFAULT_SIZE.w;
		const h = rect.height || DEFAULT_SIZE.h;
		lastMouseX = null;
		lastMouseY = null;
		button.style.width = `${w}px`;
		button.style.height = `${h}px`;
		button.style.left = `${rect.left}px`;
		button.style.top = `${rect.top}px`;

		dragging.isDragging = true;
		dragging.draggedButton = button;
		dragging.draggedButton.style.position = 'fixed';
		dragging.draggedButton.style.zIndex = '9999';
		dragging.compData = comp;

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		document.body.style.cursor = 'grabbing';
		document.body.style.userSelect = 'none';
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!dragging.isDragging) return;
		if (!dragging.initCoords) {
			dragging.initCoords = {
				x: e.clientX,
				y: e.clientY
			};
		}

		if (dragging.isDragging && dragging.draggedButton && dragging.initCoords) {
			const dx: number = e.clientX - dragging.initCoords.x;
			const dy: number = e.clientY - dragging.initCoords.y;

			dragging.draggedButton.style.transform = `translateX(${dx}px) translateY(${dy}px)`;

			lastMouseX = e.clientX;
			lastMouseY = e.clientY;
		}
	};

	const handleMouseOutLayoutComp = (defaultBehaviour: () => void): void => {
		if (
			!dragging.initCoords ||
			(Math.abs(dragging.initCoords?.x - lastMouseX!) < 5 &&
				Math.abs(dragging.initCoords?.y - lastMouseY!) < 5)
		) {
			defaultBehaviour();
		}
	};

	const handleMouseUp = () => {
		if (dragging.draggedButton) {
			dragging.draggedButton.style.position = '';
			dragging.draggedButton.style.transform = '';
			dragging.draggedButton.style.width = '';
			dragging.draggedButton.style.height = '';
			dragging.draggedButton.style.zIndex = '';
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		}

		if (lastMouseX !== null && lastMouseY !== null) {
			checkCollisionWithPossibleTargets({ x: lastMouseX, y: lastMouseY });
		}

		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		dragging = { } as draggingData;
	};

	let componentTree: ComponentConfig<any> = $state({
		compId: generateId('root'),
		component: 'TopLevelComponent',
		options: {
			component: {
				compId: generateId('placeholder'),
				component: 'PlaceholderPanel',
				options: {}
			}
		}
	});

	let componentOpts: Record<string, any> = $state({});

	const createPlaceHolder = (): ComponentConfig<MyTopLevelComponentArg<any>> => {
		return {
			compId: generateId('wrapper'),
			component: 'TopLevelComponent',
			options: {
				component: {
					compId: generateId('inner'),
					component: 'PlaceholderPanel',
					options: {}
				}
			}
		};
	};

	const exploreNode = (target: ComponentConfig<any>): ComponentConfig<any>[] => {
		const inner = target.options?.component || target;
		
		if (inner.component === 'SplitPanel') {
			return [inner.options.comp1, inner.options.comp2];
		} else if (inner.component === 'WizardPanel') {
			return inner.options.components || [];
		}
		return [];
	};

	const consumeNode = (
		target: ComponentConfig<any>
	): Array<{ wrapper: HTMLDivElement | undefined; target: ComponentConfig<any> }> => {
		const inner = target.options?.component || target;
		
		if (inner.component === 'WizardPanel') {
			return [
				{
					wrapper: inner.contentWrapper,
					target: inner
				}
			];
		} else if (inner.component === 'PlaceholderPanel') {
			return [
				{
					wrapper: inner.contentWrapper,
					target: inner
				}
			];
		}
		return [];
	};

	let availableTargets: Array<{
		wrapper: HTMLDivElement | undefined;
		target: ComponentConfig<any>;
	}> = $derived.by(() => {
		let targets: Array<{ wrapper: HTMLDivElement | undefined; target: ComponentConfig<any> }> = [];
		let toBeExplored: ComponentConfig<any>[] = [componentTree];
		
		while (toBeExplored.length > 0) {
			let frontier: ComponentConfig<any>[] = [];
			toBeExplored.forEach((cc) => {
				targets.push(...consumeNode(cc));
				frontier.push(...exploreNode(cc));
			});
			toBeExplored = frontier;
		}
		return targets;
	});

	const makeIntoSplitPane = (target: ComponentConfig<any>, axis: ResizeAxis): void => {
		target.component = 'SplitPanel';
		target.options = {
			axis: axis,
			comp1: createPlaceHolder(),
			comp2: createPlaceHolder(),
			initialComp1Proportions: 0.5
		};
	};

	const makeIntoComponent = (target: ComponentConfig<any>, replacement: ComponentConfig<any>): void => {
		if (!registeredComponents.some(comp => comp.component === replacement.component)) return;
		
		target.compId = replacement.compId;
		target.component = replacement.component;
		target.options = replacement.options;
		target.meta = replacement.meta;
		
	};

	const makeIntoWizard = (target: ComponentConfig<any>): void => {
		const compId: string = generateId('wizard');

		componentOpts[compId] = {
			components: [],
			side: wizardPipPosition as tabSide,
			control: {
				compId: generateId('control'),
				component: wizardPipPosition as tabSide === 1 || wizardPipPosition as tabSide === 3 ? 'SolutionAreaControlPanel' : 'SolutionAreaControlPanelHorizontal',
				options: {} as ControlPanelArgs
			}
		} as WizardComponentArg;

		Object.assign(target, {
			compId: compId,
			component: 'WizardPanel',
			options: componentOpts[compId] as WizardComponentArg
		})

	};

	const wizardRerouteGuard = (target: ComponentConfig<any>): ComponentConfig<MyTopLevelComponentArg<any>>  => {
		if (target.component === 'WizardPanel') {
			const newComponent: ComponentConfig<MyTopLevelComponentArg<any>>  = createPlaceHolder();
			
			newComponent.options.component.meta = {
				label: {
					commonName: `Tab ${target.options.components.length + 1}`,
					labelFor: newComponent.options.component.compId,
					icon: {
						compId: generateId('icon'),
						component: 'PlaceholderPanelIconSvg',
						options: {}
					}
				}
			};
			(componentOpts[target.compId] as WizardComponentArg).components.push(newComponent);
			return (componentOpts[target.compId] as WizardComponentArg).components[(componentOpts[target.compId] as WizardComponentArg).components.length - 1].options.component
		}
		return target;
	};

	const makeTargetIntoComponent = (target: ComponentConfig<any>): void => {
		target = wizardRerouteGuard(target);
		console.log(target);
		switch (dragging.compData.component) {
			case 'SplitPanel':
				makeIntoSplitPane(target, isResizablePipRotated ? 1 : 0);
				break;
			case 'WizardPanel':
				makeIntoWizard(target);
				break;
			default:
				makeIntoComponent(target, dragging.compData);
		}
	};

	const checkCollisionWithPossibleTargets = (cursorPosition: Coords): void => {
		for (let i = availableTargets.length - 1; i >= 0; i--) {
			const targetWrapper = availableTargets[i].wrapper;
			if (
				targetWrapper &&
				isCursorWithinBounds(cursorPosition, targetWrapper) &&
				getComputedStyle(targetWrapper).visibility === 'visible'
			) {
				makeTargetIntoComponent(availableTargets[i].target);
				break;
			}
		}
	};

	const isCursorWithinBounds = (cursorPosition: Coords, div: HTMLDivElement | undefined) => {
		if (!div) return false;
		const divDomRect: DOMRect = div.getBoundingClientRect();
		return (
			cursorPosition.x >= divDomRect.left &&
			cursorPosition.x <= divDomRect.right &&
			cursorPosition.y >= divDomRect.top &&
			cursorPosition.y <= divDomRect.bottom
		);
	};

	interface ComponentPipConfig {
		attachable: (elem: HTMLButtonElement) => void;
		display: Snippet<[any]>;
		displayArgs: object;
	}

	let isLayoutHarmonicaExpanded: boolean = $state(true);
	let isTerminalHarmonicaExpanded: boolean = $state(true);
	$inspect(isLayoutHarmonicaExpanded);
</script>

<main class="w-full h-full flex bg-ide-dcard flex-row justify-center items-center">
	<div class="w-50 h-full bg-red-500 flex flex-col">
		<span class="font-mono text-lg px-5 py-3">Components</span>
		<div class="w-full h-full bg-blue-500 flex flex-col">

			<div class="w-full flex flex-col justify-start">
				<button onclick={() => {isLayoutHarmonicaExpanded = !isLayoutHarmonicaExpanded}} class="w-full h-16 flex flex-row justify-between items-center p-1">
					<span class="px-3 py-2">Layout components</span>
					<div class="h-3 w-3 transition-all duration-75 ease-out {isLayoutHarmonicaExpanded ? "rotate-90" : ""}">
						<ChevronIconSvg options={{ class: "h-full w-full stroke-ide-text-primary" }}/>
					</div>
				</button>
				<div class="w-full {isLayoutHarmonicaExpanded ? "": "h-0"} bg-amber-400 overflow-y-hidden">
					{@render ComponentList([
						{
							attachable: (node) => {
								node.onmousedown = () => {
									handleMouseDown(node, {
										compId: generateId('wizard-panel'),
										component: 'WizardPanel',
										options: {}
									});
								};
								node.onmouseup = () =>
									handleMouseOutLayoutComp(() => (wizardPipPosition = (wizardPipPosition + 1) % 4));
							},
							display: WizardContents,
							displayArgs: {}
						},
						{
							attachable: (node) => {
								node.onmousedown = () => handleMouseDown(node, {
										compId: generateId('split-panel'),
										component: 'SplitPanel',
										options: {}
									});
								node.onmouseup = () =>
									handleMouseOutLayoutComp(() => (isResizablePipRotated = !isResizablePipRotated));
							},
							display: SplitPaneContents,
							displayArgs: {}
						}
					])}
				</div>
			</div>

			<div class="w-full flex flex-col justify-start">
				<button onclick={() => {isTerminalHarmonicaExpanded = !isTerminalHarmonicaExpanded}} class="w-full h-16 flex flex-row justify-between items-center p-1">
					<span class="px-3 py-2">Content components</span>
					<div class="h-3 w-3 transition-all duration-75 ease-out {isTerminalHarmonicaExpanded ? "rotate-90" : ""}">
						<ChevronIconSvg options={{ class: "h-full w-full stroke-ide-text-primary" }}/>
					</div>
				</button>
				<div class="w-full {isTerminalHarmonicaExpanded ? "grow": "h-0"} bg-amber-400 overflow-y-hidden">
					{@render ComponentList(
						registeredComponents.map<ComponentPipConfig>((comp) => {
							return {
								attachable: (node) => {
									node.onmousedown = () => {
										handleMouseDown(node, comp);
									};
								},
								display: TerminalContents,
								displayArgs: { componentType: comp.component ?? "name undefined" }
							};
						})
					)}
				</div>
			</div>
			
		</div>
	</div>	
	<div class="grow h-full  flex flex-col justify-start items-center px-6 py-3 flex-shrink-0">
		<span class="w-full flex justify-center items-center text-2xl text-ide-text-primary"> 
			Layout Builder Preview
		</span>
		<div class="w-full grow rounded-xl overflow-hidden border-2 border-ide-accent/20">
			<ComponentTreeRenderer {componentTree} bind:componentOpts />
		</div>
	</div>

	<!-- <div class="w-full h-[40%] flex flex-col flex-shrink-0">
		<div class="w-full h-[50%] flex flex-col justify-start">
			{@render ComponentList('Layout Components', [
				{
					attachable: (node) => {
						node.onmousedown = () => {
							handleMouseDown(node, {
								compId: generateId('wizard-panel'),
								component: 'WizardPanel',
								options: {}
							});
						};
						node.onmouseup = () =>
							handleMouseOutLayoutComp(() => (wizardPipPosition = (wizardPipPosition + 1) % 4));
					},
					display: WizardContents,
					displayArgs: {}
				},
				{
					attachable: (node) => {
						node.onmousedown = () => handleMouseDown(node, {
								compId: generateId('split-panel'),
								component: 'SplitPanel',
								options: {}
							});
						node.onmouseup = () =>
							handleMouseOutLayoutComp(() => (isResizablePipRotated = !isResizablePipRotated));
					},
					display: SplitPaneContents,
					displayArgs: {}
				}
			])}
		</div>
		<div class="w-full h-[50%] flex flex-col justify-start">
			{@render ComponentList(
				'Component Windows',
				registeredComponents.map<ComponentPipConfig>((comp) => {
					return {
						attachable: (node) => {
							node.onmousedown = () => {
								handleMouseDown(node, comp);
							};
						},
						display: TerminalContents,
						displayArgs: { componentType: comp.component ?? "name undefined" }
					};
				})
			)}
		</div>
	</div>
	<div class="w-full h-[10%] flex flex-col px-6 py-3 flex-shrink-0">
		<div class="w-full h-full bg-ide-card flex justify-end items-center gap-4 px-4 rounded-lg">
			<button
				class="h-[70%] px-6 bg-ide-accent/20 text-ide-accent border border-ide-accent/40 rounded-lg text-base font-medium hover:bg-ide-accent/30 hover:border-ide-accent/60 transition-all duration-200 active:scale-95"
				onclick={saveTree}
			>
				Save Layout
			</button>
		</div>
	</div> -->
</main>

{#snippet ComponentList(displayablePips: ComponentPipConfig[])}
	<div class="w-full flex flex-col items-center justify-start bg-ide-dcard">
		{#each displayablePips as pip}
			{@render draggablePip(pip.attachable, pip.display, pip.displayArgs)}
		{/each}
	</div>
{/snippet}


{#snippet TerminalContents(args: { componentType: string })}
  {@const Icon = ComponentRegistry.get(activeProfile.profile)?.get(`${args.componentType}IconSvg`) as Component<{ options: svgArg }>}
  	<div class="w-full h-full flex flex-col justify-start items-center">
		<div class="w-full bg-ide-dcard h-full rounded-lg overflow-hidden flex flex-col justify-center items-center">
			<Icon options={{class: "w-6 h-6 stroke-ide-text-secondary"}}/>
		</div>
		<span class="font-mono text-xs">{args.componentType}</span>
	</div>
{/snippet}


{#snippet WizardContents()}
	<div class="w-full h-full flex flex-col justify-start items-center">
		<div
			class="w-full h-full bg-ide-dcard rounded-lg flex {wizardPipPosition === 0
				? 'flex-col justify-start'
				: ''} {wizardPipPosition === 1 ? 'flex-row justify-end' : ''} {wizardPipPosition === 2
				? 'flex-col-reverse justify-start'
				: ''} {wizardPipPosition === 3 ? 'flex-row justify-start' : ''} items-center p-2">
			<div class="w-3 h-3 bg-ide-accent rounded-sm"></div>
		</div>
		<span class="font-mono text-xs">Wizard</span>
	</div>
{/snippet}

{#snippet SplitPaneContents()}
	<div class="w-full h-full flex flex-col justify-start items-center">
		<div
			class="w-full h-full bg-transparent flex gap-1 transition-transform duration-200 ease-out p-1 {isResizablePipRotated
				? 'rotate-90'
				: ''}"
		>
			<div class="flex-1 h-full bg-ide-dcard rounded-md border border-ide-accent/40"></div>
			<div class="flex-1 h-full bg-ide-dcard rounded-md border border-ide-accent/40"></div>
		</div>
		<span class="font-mono text-xs">Split</span>

	</div>

{/snippet}

{#snippet draggablePip(attachable: (elem: HTMLButtonElement) => void, display: Snippet<[any]>, displayArgs: object)}
	<div class="w-40 h-24 flex-shrink-0">
		<div class="w-full h-full p-2 flex border-2 border-ide-accent/30 rounded-xl bg-ide-card hover:border-ide-accent/60 transition-colors">
			<button {@attach attachable} class="flex-grow rounded-lg hover:bg-ide-accent/5 transition-colors cursor-grab active:cursor-grabbing">
				{@render display(displayArgs)}
			</button>
		</div>
	</div>
{/snippet}