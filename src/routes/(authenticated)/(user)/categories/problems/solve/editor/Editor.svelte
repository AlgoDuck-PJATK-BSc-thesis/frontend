<script lang="ts">
	import { tick, type Component, type Snippet } from "svelte";
	import type { svgArg } from "$lib/types/SvgIcon";
	import { activeProfile, ComponentRegistry } from "$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte";
	import type { ComponentConfig, ControlPanelArgs, ControlPanelArgsBuild, MyTopLevelComponentArg, ResizeAxis, tabSide, WizardComponentArg } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
	import ComponentTreeRenderer from "$lib/Components/GenericComponents/layoutManager/ComponentTreeRenderer.svelte";
	import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
	import CreationModal from "./CreationModal.svelte";
	import { ApiError, FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import ToolTip from "../../../../../(admin)/problem/upsert/ToolTip.svelte";
	import type { LayoutCreationResultDto } from "./EditorEditorTypes";
	import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";
	import { toast } from "$lib/Components/Notifications/ToastStore.svelte";
	import { useQueryClient } from "@tanstack/svelte-query";

	type Coords = { x: number; y: number };

	let { registeredComponents }: { registeredComponents: ComponentConfig<any>[] } = $props();

	let wizardPipPosition: number = $state(0);
	let componentIdCounter: number = $state(0);
	let validationErrors: string[] = $state([]);
	let showValidationModal: boolean = $state(false);
	let shouldRender: boolean = $state(true);

	const generateId = (prefix: string): string => {
		return `${prefix}-${Date.now()}-${componentIdCounter++}`;
	};

	type ValidationResult = {
		isValid: boolean;
		errors: string[];
		warnings: string[];
		orphanTargets: HTMLDivElement[];
	};

	let placedComponentTypes: Set<string> = $state(new Set());

	let placedComponents: Set<string> = $derived.by(() => {
		const result = new Set(placedComponentTypes);
		if (placedComponentTypes.has('TerminalWizardPanel')) {
			result.add('AssistantWizard');
		}
		return result;
	});

  let orphanPlaceholders = $derived.by(() => {
       const allPlaceholders = availableTargets.filter(t => t.target.component === 'PlaceholderPanel');
       
       const wizardTabPlaceholderIds = new Set<string>();
       availableTargets
           .filter(t => t.target.component === 'WizardPanel' || t.target.component === 'TerminalWizardPanel')
           .forEach(wt => {
               wt.target.options?.components?.forEach((tabWrapper: any) => {
                   const tabContent = tabWrapper?.options?.component;
                   if (tabContent?.component === 'PlaceholderPanel') {
                       wizardTabPlaceholderIds.add(tabContent.compId);
                   }
               });
           });
       
       return allPlaceholders.filter(p => !wizardTabPlaceholderIds.has(p.target.compId));
   });

	const validateTree = (): ValidationResult => {
		const errors: string[] = [];
		const warnings: string[] = [];
		const orphanTargets: HTMLDivElement[] = [];
		
		orphanPlaceholders.forEach(({ wrapper, target }) => {
			errors.push(`Empty placeholder: ${target.compId}`);
			if (wrapper) {
				orphanTargets.push(wrapper);
			}
		});
		
		availableTargets
			.filter(t => t.target.component === 'WizardPanel' || t.target.component === 'TerminalWizardPanel')
			.forEach(({ target }) => {
				if (!target.options?.components || target.options.components.length === 0) {
					warnings.push(`WizardPanel ${target.compId} has no tabs`);
				}
			});
		
		return {
			isValid: errors.length === 0,
			errors,
			warnings,
			orphanTargets
		};
	};

	const flashOrphanPlaceholders = (): void => {
		orphanPlaceholders.forEach(({ wrapper }) => {
			wrapper?.classList?.add('orphan-flash');
			setTimeout(() => {
				wrapper?.classList?.remove('orphan-flash');
			}, 2000);
		});
	};


	const serializeTree = (): string | undefined => {
		const validation = validateTree();
		
		if (!validation.isValid) {
			validationErrors = [...validation.errors, ...validation.warnings.map(w => `Warning: ${w}`)];
			showValidationModal = true;
			
			validation.orphanTargets.forEach(wrapper => {
				wrapper.classList.add('orphan-flash');
				setTimeout(() => wrapper.classList.remove('orphan-flash'), 2000);
			});
			return;
		}
		
		let toBeExplored: ComponentConfig<any>[] = [componentTree];
		while (toBeExplored.length > 0) {
			const frontier: ComponentConfig<any>[] = [];

			for (const cc of toBeExplored) {
				cc.contentWrapper = undefined;
				const nodeStripped: ComponentConfig<any> = cc.options.component;
				if (nodeStripped) {
					nodeStripped.contentWrapper = undefined;
					if (nodeStripped.component === "WizardPanel" || nodeStripped.component === "TerminalWizardPanel") {
						nodeStripped.options.componentsContainer = undefined;
						frontier.push(...(nodeStripped.options.components || []));
					} else if (nodeStripped.component === "SplitPanel") {
						frontier.push(nodeStripped.options.comp1, nodeStripped.options.comp2);
					}
				}
			}

			toBeExplored = frontier;
		}

		console.log(JSON.stringify(componentTree, null, 2));
		return JSON.stringify(componentTree, null, 2);
	};

	const handleCleanupAndSave = (): void => {
		showValidationModal = false;
		serializeTree();
	};

	let isResizablePipRotated: boolean = $state(false);

	type draggingData = {
		isDragging: boolean;
		draggedButton: HTMLButtonElement;
		initCoords: { x: number; y: number };
		compData: ComponentConfig<any>;
		originalRect: DOMRect;
	};

	let lastMouseX: number | null = null;
	let lastMouseY: number | null = null;

	let dragging: draggingData = $state({} as draggingData);

	const handleMouseMove = (e: MouseEvent) => {
		if (!dragging.isDragging || !dragging.draggedButton || !dragging.initCoords) return;

		const dx: number = e.clientX - dragging.initCoords.x;
		const dy: number = e.clientY - dragging.initCoords.y;

		dragging.draggedButton.style.transform = `translateX(${dx}px) translateY(${dy}px)`;

		lastMouseX = e.clientX;
		lastMouseY = e.clientY;
	};

	const handleMouseUp = (onClickFallback?: () => void) => {
		const wasClick = dragging.initCoords && 
			lastMouseX !== null && lastMouseY !== null &&
			Math.abs(lastMouseX - dragging.initCoords.x) < 5 &&
			Math.abs(lastMouseY - dragging.initCoords.y) < 5;

		if (dragging.draggedButton) {
			dragging.draggedButton.style.position = '';
			dragging.draggedButton.style.transform = '';
			dragging.draggedButton.style.width = '';
			dragging.draggedButton.style.height = '';
			dragging.draggedButton.style.left = '';
			dragging.draggedButton.style.top = '';
			dragging.draggedButton.style.zIndex = '';
			document.body.style.cursor = '';
			document.body.style.userSelect = '';
		}

		if (!wasClick && lastMouseX !== null && lastMouseY !== null) {
			checkCollisionWithPossibleTargets({ x: lastMouseX, y: lastMouseY });
		}

		dragging = {} as draggingData;
		lastMouseX = null;
		lastMouseY = null;

		if (wasClick && onClickFallback) {
			onClickFallback();
		}
	};

	const handleMouseUpGlobal = () => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUpGlobal);
		handleMouseUp();
	};

	const createMouseUpHandler = (fallback?: () => void) => {
		const handler = () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handler);
			handleMouseUp(fallback);
		};
		return handler;
	};

	const handleMouseDownWithFallback = (e: MouseEvent, button: HTMLButtonElement, comp: ComponentConfig<any>, onClickFallback?: () => void) => {
		const rect = button.getBoundingClientRect();
		
		lastMouseX = e.clientX;
		lastMouseY = e.clientY;

		button.style.width = `${rect.width}px`;
		button.style.height = `${rect.height}px`;
		button.style.left = `${rect.left}px`;
		button.style.top = `${rect.top}px`;
		button.style.position = 'fixed';
		button.style.zIndex = '9999';

		dragging = {
			isDragging: true,
			draggedButton: button,
			initCoords: { x: e.clientX, y: e.clientY },
			compData: comp,
			originalRect: rect
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', createMouseUpHandler(onClickFallback));

		document.body.style.cursor = 'grabbing';
		document.body.style.userSelect = 'none';
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
		if (!target) return [];
		const inner = target.options?.component || target;
		
		if (inner.component === 'SplitPanel') {
			const results: ComponentConfig<any>[] = [];
			if (inner.options?.comp1) results.push(inner.options.comp1);
			if (inner.options?.comp2) results.push(inner.options.comp2);
			return results;
		} else if (inner.component === 'WizardPanel') {
			return inner.options?.components || [];
		}
		return [];
	};

	const consumeNode = (
		target: ComponentConfig<any>
	): Array<{ wrapper: HTMLDivElement | undefined; target: ComponentConfig<any> }> => {
		if (!target) return [];
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

	const findExistingComponent = (componentType: string): { parent: ComponentConfig<any>, key: string, config: ComponentConfig<any> } | null => {
		const search = (node: ComponentConfig<any>, parent: ComponentConfig<any> | null, parentKey: string): { parent: ComponentConfig<any>, key: string, config: ComponentConfig<any> } | null => {
			if (!node) return null;
			const inner = node.options?.component || node;
			
			if (inner.component === componentType) {
				return parent ? { parent, key: parentKey, config: node } : null;
			}
			
			if (inner.component === 'SplitPanel') {
				if (inner.options?.comp1) {
					const inComp1 = search(inner.options.comp1, inner, 'comp1');
					if (inComp1) return inComp1;
				}
				if (inner.options?.comp2) {
					return search(inner.options.comp2, inner, 'comp2');
				}
			} else if (inner.component === 'WizardPanel') {
				for (let i = 0; i < (inner.options?.components?.length || 0); i++) {
					const result = search(inner.options.components[i], inner, `components[${i}]`);
					if (result) return result;
				}
			}
			
			return null;
		};
		
		return search(componentTree, null, '');
	};

	const componentExistsInTree = (componentType: string): boolean => {
		return findExistingComponent(componentType) !== null;
	};

	const getTerminalComponentTypes = (): Set<string> => {
		return new Set(registeredComponents.map(c => c.component));
	};

	const getFixedCompId = (componentType: string): string | undefined => {
		const registered = registeredComponents.find(c => c.component === componentType);
		return registered?.compId;
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
		Object.assign(target, {
			component: 'SplitPanel',
			options: {
				axis: axis,
				comp1: createPlaceHolder(),
				comp2: createPlaceHolder(),
				initialComp1Proportions: 0.5
			}
		});
	};

	const makeIntoComponent = (target: ComponentConfig<any>, replacement: ComponentConfig<any>): void => {
		if (!registeredComponents.some(comp => comp.component === replacement.component)) return;
		
		const terminalTypes = getTerminalComponentTypes();
		
		if (terminalTypes.has(replacement.component) && componentExistsInTree(replacement.component)) {
			return;
		}
		
		const fixedId = getFixedCompId(replacement.component);
		const compId = fixedId || replacement.compId;
		
		const clonedReplacement = JSON.parse(JSON.stringify(replacement));
		clonedReplacement.compId = compId;
		if (clonedReplacement.meta?.label) {
			clonedReplacement.meta.label.labelFor = compId;
		}
		
		target.compId = clonedReplacement.compId;
		target.component = clonedReplacement.component;
		target.options = clonedReplacement.options;
		target.meta = clonedReplacement.meta;
	};

	const makeIntoWizard = (target: ComponentConfig<any>): void => {
		const compId: string = generateId('wizard');
		const controlCompType = (wizardPipPosition as tabSide) === 1 || (wizardPipPosition as tabSide) === 3 
			? 'SolutionAreaControlPanel' 
			: 'SolutionAreaControlPanelHorizontal';

		componentOpts[compId] = {
			components: [],
			side: wizardPipPosition as tabSide,
			control: {
				compId: generateId('control'),
				component: controlCompType,
				options: {} as ControlPanelArgs
			}
		} as WizardComponentArg;

		Object.assign(target, {
			compId: compId,
			component: 'WizardPanel',
			options: componentOpts[compId] as WizardComponentArg
		});
	};

	const wizardRerouteGuard = (target: ComponentConfig<any>): ComponentConfig<MyTopLevelComponentArg<any>> => {
		if (target.component === 'WizardPanel') {
			const newComponent: ComponentConfig<MyTopLevelComponentArg<any>> = createPlaceHolder();
			
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
			return (componentOpts[target.compId] as WizardComponentArg).components[(componentOpts[target.compId] as WizardComponentArg).components.length - 1].options.component;
		}
		return target;
	};

	const makeTargetIntoComponent = (target: ComponentConfig<any>): void => {
		if (target.component === 'WizardPanel' && (dragging.compData.component === 'WizardPanel')) return;
		
		target = wizardRerouteGuard(target);
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
			if (targetWrapper && isCursorWithinBounds(cursorPosition, targetWrapper)) {
				makeTargetIntoComponent(availableTargets[i].target);
				break;
			}
		}
	};

	const isCursorWithinBounds = (cursorPosition: Coords, div: HTMLDivElement | undefined) => {
		if (!div) return false;
		const divDomRect: DOMRect = div.getBoundingClientRect();
		return (cursorPosition.x >= divDomRect.left && cursorPosition.x <= divDomRect.right && cursorPosition.y >= divDomRect.top && cursorPosition.y <= divDomRect.bottom);
	};

	interface ComponentPipConfig {
		attachable: (elem: HTMLButtonElement) => void;
		display: Snippet<[any]>;
		displayArgs: object;
		isPlaced?: boolean;
	}

	let isLayoutHarmonicaExpanded: boolean = $state(true);
	let isContentHarmonicaExpanded: boolean = $state(true);

	const contextInjectors: Record<string, (options: any) => void> = {
		'SolutionAreaControlPanel': (opts: ControlPanelArgsBuild) => {
			const wizardId = findWizardIdForControlPanel(opts);
			if (wizardId) {
				opts.removeComp = (compId: string) => removeComponentFromWizard(wizardId, compId);
				opts.swapComponents = (idx1: number, idx2: number) => swapComponentsInWizard(wizardId, idx1, idx2);
			}
		},
		'SolutionAreaControlPanelHorizontal': (opts: ControlPanelArgsBuild) => {
			const wizardId = findWizardIdForControlPanel(opts);
			if (wizardId) {
				opts.removeComp = (compId: string) => removeComponentFromWizard(wizardId, compId);
				opts.swapComponents = (idx1: number, idx2: number) => swapComponentsInWizard(wizardId, idx1, idx2);
			}
		}
	};

	const findWizardIdForControlPanel = (controlOpts: ControlPanelArgs): string | null => {
		for (const [wizardId, wizardOpts] of Object.entries(componentOpts)) {
			if ((wizardOpts as WizardComponentArg)?.control?.options === controlOpts) {
				return wizardId;
			}
		}
		for (const [wizardId, wizardOpts] of Object.entries(componentOpts)) {
			const wizard = wizardOpts as WizardComponentArg;
			if (wizard?.components && controlOpts.labels) {
				const wizardLabels = wizard.components.filter(c => c.options.component.meta?.label).map(c => c.options.component.meta!.label!.labelFor);

				const controlLabels = controlOpts.labels.map(l => l.labelFor);
				if (wizardLabels.length > 0 && controlLabels.length > 0 && 
					wizardLabels.some(wl => controlLabels.includes(wl))) {
					return wizardId;
				}
			}
		}
		return null;
	};

	const removeComponentFromWizard = (wizardId: string, compId: string): void => {
		const wizard = componentOpts[wizardId] as WizardComponentArg;
		if (wizard?.components) {
			wizard.components = wizard.components.filter(
				c => c.options.component.compId !== compId
			);
		}
	};

	const swapComponentsInWizard = (wizardId: string, idx1: number, idx2: number): void => {
		const wizard = componentOpts[wizardId] as WizardComponentArg;
		if (wizard?.components && idx1 >= 0 && idx2 >= 0 && idx1 < wizard.components.length && idx2 < wizard.components.length) {
			[wizard.components[idx1], wizard.components[idx2]] = [wizard.components[idx2], wizard.components[idx1]];
		}
	};

	const resetLayout = async (): Promise<void> => {
		shouldRender = false;
		await tick();

		componentTree = {
			compId: generateId('root'),
			component: 'TopLevelComponent',
			options: {
				component: {
					compId: generateId('placeholder'),
					component: 'PlaceholderPanel',
					options: {}
				}
			}
		};
		componentOpts = {};
		
		await tick();
		shouldRender = true;
	};

	type TerminalPipArgs = { 
		component: ComponentConfig<any>,
		isPlaced?: boolean 
	}


	const queryClient = useQueryClient();

	let creationModalArgs = $state({ 
		isVisible: false,
		onclick: async (layoutName: string): Promise<StandardResponseDto<LayoutCreationResultDto> | undefined> => {
		let treeSerialized: string | undefined = serializeTree();
		if (!treeSerialized) return;

		try{
			let res = await FetchFromApi<LayoutCreationResultDto>("CreateLayout",{
				method: "POST",
				body: JSON.stringify({
					layoutContent: treeSerialized,
					layoutName: layoutName
				})
			});

			queryClient.invalidateQueries({queryKey: [ "custom-layout" ]})
			creationModalArgs.isVisible = false;
			history.back();
			return res;
		}catch(err){
			if (err instanceof ApiError){
				toast.error(err.response.body ?? "could not create layout");
			}
		}
	}})
</script>

{#if creationModalArgs.isVisible}
	<CreationModal bind:options={creationModalArgs}/>
{/if}

<main {@attach (node) => {
	activeProfile.profile = 'builder'
	return () => {
		activeProfile.profile = 'default';
	};
	}} class="w-full h-full flex bg-ide-dcard flex-row rounded-xl overflow-hidden">
	<div class="w-56 h-full bg-ide-card flex flex-col border-r border-ide-accent/20">
		<div class="px-4 py-3 border-b border-ide-accent/20">
			<span class="font-semibold text-lg text-ide-text-primary">Components</span>
		</div>
		
		<div class="flex-1 overflow-y-auto">
			<div class="border-b border-ide-accent/10">
				<button 
					onclick={() => isLayoutHarmonicaExpanded = !isLayoutHarmonicaExpanded} 
					class="w-full h-12 flex flex-row justify-between items-center px-4 hover:bg-ide-accent/5 transition-colors">
					<div class="flex flex-row grow gap-3">
						<span class="text-sm font-medium text-ide-text-secondary">Layout</span>
						<ToolTip options={{ tip: "These components \nhold the useful stuff \nin an arranged way \nclick to rotate \ndrop to emplace"}}/>	
					</div>
					<div class="h-3 w-3 transition-transform duration-150 ease-out {isLayoutHarmonicaExpanded ? 'rotate-90' : ''}">
						<ChevronIconSvgNew options={{ class: "h-full w-full stroke-[2] stroke-ide-text-secondary" }}/>
					</div>
				</button>
				
				{#if isLayoutHarmonicaExpanded}
					<div class="px-2 pb-3 flex flex-wrap gap-2 justify-center">
						{@render ComponentList([
							{
								attachable: (node) => {
									node.onmousedown = (e) => {
										handleMouseDownWithFallback(e, node, {
											compId: generateId('wizard-panel'),
											component: 'WizardPanel',
											options: {}
										}, () => { wizardPipPosition = (wizardPipPosition + 1) % 4; });
									};
								},
								display: WizardContents,
								displayArgs: {}
							},
							{
								attachable: (node) => {
									node.onmousedown = (e) => {
										handleMouseDownWithFallback(e, node, {
											compId: generateId('split-panel'),
											component: 'SplitPanel',
											options: {}
										}, () => { isResizablePipRotated = !isResizablePipRotated; });
									};
								},
								display: SplitPaneContents,
								displayArgs: {}
							}
						])}
					</div>
				{/if}
			</div>

			<div class="border-b border-ide-accent/10">
				<button onclick={() => isContentHarmonicaExpanded = !isContentHarmonicaExpanded} 
					class="w-full h-12 flex flex-row justify-between items-center px-4 hover:bg-ide-accent/5 transition-colors">
					<div class="flex flex-row gap-3 grow">
						<span class="text-sm font-medium text-ide-text-secondary">Content</span>
						<ToolTip options={{ tip: "These components \ncontain the useful \nstuff. Drop inside \nthe layout components" }}/>	
					</div>
					<div class="h-3 w-3 transition-transform duration-150 ease-out {isContentHarmonicaExpanded ? 'rotate-90' : ''}">
						<ChevronIconSvgNew options={{ class: "h-full w-full stroke-[2] stroke-ide-text-secondary" }}/>
					</div>
				</button>
				
				{#if isContentHarmonicaExpanded}
					<div class="px-2 pb-3 flex flex-wrap gap-2 justify-center">
						{@render ComponentList([
							...registeredComponents.map<ComponentPipConfig>((comp) => ({
								attachable: (node) => {
									node.onmousedown = (e) => {
										if (placedComponents.has(comp.component)) return;
										handleMouseDownWithFallback(e, node, comp);
									};
								},
								display: ContentCompContents,
								displayArgs: { 
									component: comp,
									isPlaced: placedComponents.has(comp.component)
								} as TerminalPipArgs,
								isPlaced: placedComponents.has(comp.component)
							}))
						])}
					</div>
				{/if}
			</div>
		</div>

		<div class="p-3 border-t border-ide-accent/20 flex flex-col gap-2">
			{#if orphanPlaceholders.length > 0}
				<button
					class="w-full py-2 px-4 bg-red-500/20 text-red-400 border border-red-500/40 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-all duration-200 active:scale-[0.98]"
					onclick={flashOrphanPlaceholders}>
					<span>{orphanPlaceholders.length} empty slot{orphanPlaceholders.length > 1 ? 's' : ''}</span>
				</button>
			{/if}
			<button
				class="w-full py-2 px-4 bg-ide-accent/20 text-ide-accent border border-ide-accent/40 rounded-lg text-sm font-medium hover:bg-ide-accent/30 hover:border-ide-accent/60 transition-all duration-200 active:scale-[0.98]"
				onclick={() => {
					if (orphanPlaceholders.length){
							flashOrphanPlaceholders();
							return;
						}
					creationModalArgs.isVisible = true
				}}>
				Save Layout
			</button>
			<button
				class="w-full py-2 px-4 bg-transparent text-ide-text-secondary border border-ide-text-secondary/30 rounded-lg text-sm font-medium hover:bg-ide-text-secondary/10 transition-all duration-200 active:scale-[0.98]"
				onclick={resetLayout}
			>
				Reset
			</button>
		</div>
	</div>
	
	<div class="flex-1 h-full flex flex-col">
		<div class="h-14 px-6 flex items-center justify-between border-b border-ide-accent/20 bg-ide-bg">
			<span class="text-xl font-semibold text-ide-text-primary">Layout Builder</span>
			<div class="flex items-center gap-2 text-sm text-ide-text-secondary">
				<span>Drag components to the preview area</span>
			</div>
		</div>
		
		<div class="flex-1 p-6 bg-ide-bg overflow-hidden">
			<div class="w-full h-full rounded-xl overflow-hidden border-2 border-ide-accent/20 bg-ide-dcard">
				{#if shouldRender}
					<ComponentTreeRenderer {componentTree} bind:componentOpts {contextInjectors} />
				{/if}
			</div>
		</div>
	</div>
</main>

{#if showValidationModal}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
		<div class="bg-ide-card rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
			<h3 class="text-lg font-semibold text-ide-text-primary mb-4">Layout Validation</h3>
			
			<div class="max-h-64 overflow-y-auto mb-4">
				{#each validationErrors as error}
					<div class="py-2 px-3 mb-2 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-400">
						{error}
					</div>
				{/each}
			</div>
			
			<div class="flex gap-3">
				<button
					class="flex-1 py-2 px-4 bg-ide-accent/20 text-ide-accent border border-ide-accent/40 rounded-lg text-sm font-medium hover:bg-ide-accent/30 transition-all"
					onclick={handleCleanupAndSave}
				>
					Clean & Save
				</button>
				<button
					class="flex-1 py-2 px-4 bg-transparent text-ide-text-secondary border border-ide-text-secondary/30 rounded-lg text-sm font-medium hover:bg-ide-text-secondary/10 transition-all"
					onclick={() => showValidationModal = false}
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

{#snippet ComponentList(displayablePips: ComponentPipConfig[])}
	{#each displayablePips as pip}
		{@render draggablePip(pip.attachable, pip.display, pip.displayArgs, pip.isPlaced)}
	{/each}
{/snippet}

{#snippet ContentCompContents(args: TerminalPipArgs)}
	{@const Icon = ComponentRegistry.get(activeProfile.profile)?.get(args.component?.meta?.label?.icon?.component ?? "") as Component<{ options: svgArg }> | undefined}
	<div class="w-full h-full flex flex-col items-center justify-center gap-1 {args.isPlaced ? 'opacity-40' : ''}">
		{#if Icon}
			<div class="w-6 h-6">
				<Icon options={{class: "w-full h-full stroke-ide-text-secondary"}}/>
			</div>
		{:else}
			<div class="w-6 h-6 rounded bg-ide-accent/20"></div>
		{/if}
		<span class="font-mono text-[10px] text-ide-text-secondary truncate max-w-full px-1">
			{args.component?.meta?.label?.commonName ?? "<undefined>"}
		</span>
		{#if args.isPlaced}
			<span class="text-[8px] text-green-500">✓ placed</span>
		{/if}
	</div>
{/snippet}

{#snippet WizardContents()}
	<div class="w-full h-full flex flex-col items-center justify-center gap-1">
		<div
			class="w-10 h-8 bg-ide-dcard rounded flex {wizardPipPosition === 0
				? 'flex-col justify-start'
				: ''} {wizardPipPosition === 1 ? 'flex-row justify-end' : ''} {wizardPipPosition === 2
				? 'flex-col-reverse justify-start'
				: ''} {wizardPipPosition === 3 ? 'flex-row justify-start' : ''} items-center p-1"
		>
			<div class="w-2 h-2 bg-ide-accent rounded-sm"></div>
		</div>
		<span class="font-mono text-[10px] text-ide-text-secondary">Wizard</span>
	</div>
{/snippet}

{#snippet SplitPaneContents()}
	<div class="w-full h-full flex flex-col items-center justify-center gap-1">
		<div
			class="w-10 h-8 flex gap-0.5 transition-transform duration-200 ease-out {isResizablePipRotated ? 'rotate-90' : ''}"
		>
			<div class="flex-1 h-full bg-ide-dcard rounded-sm border border-ide-accent/40"></div>
			<div class="flex-1 h-full bg-ide-dcard rounded-sm border border-ide-accent/40"></div>
		</div>
		<span class="font-mono text-[10px] text-ide-text-secondary">Split</span>
	</div>
{/snippet}

{#snippet draggablePip(attachable: (elem: HTMLButtonElement) => void, display: Snippet<[any]>, displayArgs: object, isPlaced?: boolean)}
	<div class="w-20 h-20 flex-shrink-0">
		<button 
			{@attach attachable}
			class="w-full h-full p-2 flex items-center justify-center border rounded-lg transition-colors 
				{isPlaced 
					? 'border-green-500/30 bg-green-500/5 cursor-not-allowed' 
					: 'border-ide-accent/20 bg-ide-bg hover:border-ide-accent/50 hover:bg-ide-accent/5 cursor-grab active:cursor-grabbing'}"
		>
			{@render display(displayArgs)}
		</button>
	</div>
{/snippet}

<svelte:head>
	<style>
		@keyframes orphan-flash {
			0%, 100% { box-shadow: inset 0 0 0 3px transparent; }
			25%, 75% { box-shadow: inset 0 0 0 3px rgb(239 68 68); }
			50% { box-shadow: inset 0 0 0 3px rgb(239 68 68 / 0.5); }
		}
		.orphan-flash {
			animation: orphan-flash 0.5s ease-in-out 4;
		}
	</style>
</svelte:head>