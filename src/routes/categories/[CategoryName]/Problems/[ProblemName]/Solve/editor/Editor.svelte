<script lang="ts">
  import { activeProfile, ComponentRegistry } from "./ComponentRegistry.svelte";

	import type { ComponentConfig, MyTopLevelComponentArg, ResizeAxis, ComponentType, tabSide, Coords } from "./ResizableComponentArg";;
	import { onDestroy, type Component, type Snippet } from "svelte";
	import type { svgArg } from "$lib/types/SvgIcon";

	import { saveLayout } from "$lib/stores/theme.svelte";
	import PlaceholderPanelIconSvg from "$lib/svg/EditorComponentIcons/PlaceholderPanelIconSvg.svelte";

  let { registeredComponents } : { registeredComponents: Record<ComponentType, object> } = $props();
  
  let wizardPipPosition: number = $state(0);
  
  onDestroy(()=>{
    activeProfile.profile = 'default';
  })

  const saveTree = (): void => {
    let toBeExplored: ComponentConfig<any>[] = [rootConfig];
    while (toBeExplored.length > 0) {
      const frontier: ComponentConfig<any>[] = [];

      for (const cc of toBeExplored) {
        cc.contentWrapper = undefined
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
    saveLayout(layoutName, JSON.stringify(rootConfig));
  };

  let isResizablePipRotated: boolean = $state(false);

  type draggingData = {
    isDragging: boolean,
    draggedButton: HTMLButtonElement | undefined,
    initCoords: Coords | undefined,
    draggedTileType: ComponentType | undefined
  }

  let lastMouseX: number | null = null;
  let lastMouseY: number | null = null;

  let dragging: draggingData = $state({
    isDragging: false,
    draggedButton: undefined,
    initCoords: undefined,
    draggedTileType: undefined,
  });

  const DEFAULT_SIZE = { w: 160, h: 96 };

  const handleMouseDown = (button: HTMLButtonElement, type: ComponentType) => {
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
    dragging.draggedTileType = type;

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup',  handleMouseUp);

		document.body.style.cursor = 'grabbing';
		document.body.style.userSelect = 'none';
	};

  const handleMouseMove = (e: MouseEvent) => {
		if (!dragging.isDragging) return;
    if (!dragging.initCoords){
      dragging.initCoords = {
        x: e.clientX,
        y: e.clientY,
      };
    }

    if (dragging.isDragging && dragging.draggedButton && dragging.initCoords){
      const dx: number = e.clientX - dragging.initCoords.x;
      const dy: number = e.clientY - dragging.initCoords.y;

      dragging.draggedButton.style.transform = `translateX(${dx}px) translateY(${dy}px)`;
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
	};

  const handleMouseOutLayoutComp = (defaultBehaviour: () => void): void => {
    if (!dragging.initCoords || (Math.abs(dragging.initCoords?.x - lastMouseX!) < 5 && Math.abs(dragging.initCoords?.y - lastMouseY!) < 5)){
      defaultBehaviour();
    }
  }

  const handleMouseUp = () => {
    if (dragging.draggedButton){
      dragging.draggedButton.style.position = '';
      dragging.draggedButton.style.transform = '';
      dragging.draggedButton.style.width = '';
      dragging.draggedButton.style.height = '';
      document.body.style.cursor = '';
		  document.body.style.userSelect = '';
    }

    checkCollisionWithPossibleTargets({x: lastMouseX!, y: lastMouseY!})    

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    dragging = {
      isDragging: false,
      draggedButton: undefined,
      initCoords: undefined,
      draggedTileType: undefined,
    }
	};


  let rootCompType: ComponentType = $state('TopLevelComponent');
  let RootComp: Component<any> = $derived(ComponentRegistry.get(activeProfile.profile)!.get(rootCompType)!);

  let rootArgs: MyTopLevelComponentArg<any> = $state({
    component: {
      component: 'PlaceholderPanel',
      options: {},
      contentWrapper: undefined,
    }
  });

  let rootConfig: ComponentConfig<any> = $derived({
    component: rootCompType,
    options: rootArgs,
  });


  const createPlaceHolder = (): ComponentConfig<any> => {
    return {
      component: 'TopLevelComponent',
      options: {
        component: {
          component: 'PlaceholderPanel',
          options: {},
          contentWrapper: undefined,
        }   
      }
    };
  }

  const exploreNode = (target: ComponentConfig<any>) : ComponentConfig<any>[] => {
    if (target.options.component.component === 'SplitPanel'){
      return [ target.options.component.options.comp1, target.options.component.options.comp2 ];
    }else if (target.options.component.component === 'WizardPanel'){
      return target.options.component.options.components;
    }else{
      return [];
    }
  }

  const consumeNode = (target: ComponentConfig<any>): Array<{ wrapper: HTMLDivElement | undefined, target: ComponentConfig<any> }> => {
    const nodeStripped: ComponentConfig<any> = target.options.component;
    if (nodeStripped.component === 'WizardPanel'){
      return [{
        wrapper: nodeStripped.options.componentsContainer,
        /* 
          the logic here is that we realistically have 2 options,
          Either we make the wizard component in the editor a fully functional wizard and require the user to switch between tabs to populate it.
          or make a bin that takes whatever you throw into it and allows you to rearrange it separetely.

          Frankly options 2 sounds better to me so we need to designate the actual wizard component as the target.
          Then when in the add function check whether the component we've been given as a target is a placeholder (like in empty root or splitComponent size), or wizard and act accordingly

        */
        target: target.options.component, 
      }];
    }else if (nodeStripped.component === 'PlaceholderPanel'){
      return [{
        wrapper: nodeStripped.contentWrapper,
        target: target.options.component, 
      }];
    }else{
      return [];
    }
  }

  let availableTargets: Array<{ wrapper: HTMLDivElement | undefined, target: ComponentConfig<any> }> = $derived.by(()=>{
    let targets: Array<{ wrapper: HTMLDivElement | undefined, target: ComponentConfig<any> }> = [];
    let toBeExplored: ComponentConfig<any>[] = [ rootConfig ];
    let totalExplored = 0;
    while (toBeExplored.length > 0){
      totalExplored += toBeExplored.length
      let frontier: ComponentConfig<any>[] = []
        toBeExplored.forEach(cc => {
          targets.push(...consumeNode(cc));
          frontier.push(...exploreNode(cc)) 
        })
      toBeExplored = frontier;
    }
    return targets;
  });

  const makeIntoSplitPane = (target: ComponentConfig<any>, axis: ResizeAxis): void => {    
    target.component = 'SplitPanel'
    target.options = {
        axis: axis,
        comp1: createPlaceHolder(),
        comp2: createPlaceHolder(),
        initialComp1Proportions: 0.50
      }
  }

  const makeIntoTerminalComponent = (target: ComponentConfig<any>, windowType: ComponentType): void => {    
    if (registeredComponents[windowType]){
      target.component = windowType;
      target.options = registeredComponents[windowType];
    }
  }

  const makeIntoWizard = (target: ComponentConfig<any>): void => {
    target.component = 'WizardPanel';
    target.options = {
      components: [],
      componentsContainer: undefined,
      side: wizardPipPosition as tabSide,
    }
  }

  const wizardRerouteGuard = (target: ComponentConfig<any>): ComponentConfig<any> => {
    if (target.component === 'WizardPanel'){
      const wizardPaneIndex: number = target.options.components.push(createPlaceHolder()) - 1;
      return target.options.components[wizardPaneIndex].options.component;
    }
    return target;
  }

  const makeTargetIntoComponent = (target: ComponentConfig<any>): void => {
    target = wizardRerouteGuard(target);
    switch (dragging.draggedTileType){
      case 'SplitPanel':
        makeIntoSplitPane(target, isResizablePipRotated ? 1 : 0);
        break;
      case 'WizardPanel':
        makeIntoWizard(target);
        break;
      default:
        makeIntoTerminalComponent(target, dragging.draggedTileType!);
    }
  }

  const checkCollisionWithPossibleTargets = (cursorPosition: Coords): void => {
    for (let i = availableTargets.length - 1; i >= 0; i--){
      if (isCursorWithinBounds(cursorPosition, availableTargets[i].wrapper) && getComputedStyle(availableTargets[i].wrapper!).visibility === 'visible'){
        makeTargetIntoComponent(availableTargets[i].target);
        break;
      }
    }
  }

  const isCursorWithinBounds = (cursorPosition: Coords, div: HTMLDivElement | undefined) => {
    if (!div) return false;
    const divDomRect: DOMRect = div.getBoundingClientRect();
    return (cursorPosition.x >= divDomRect.left && cursorPosition.x <= divDomRect.right && cursorPosition.y >= divDomRect.top && cursorPosition.y <= divDomRect.bottom)
  }

  interface ComponentPipConfig {
    attachable: (elem: HTMLButtonElement) => void,
    display: Snippet<[any]>,
    displayArgs: object
  }
</script>

<main class="w-full h-full flex bg-ide-dcard flex-col justify-start items-center overflow-x-hidden overflow-y-scroll">
  <div class="w-full h-[80%] flex flex-col justify-start items-center px-6 py-3 flex-shrink-0">
    <div class="w-full h-[8%]">
      <span class="w-full h-full flex justify-center items-center text-2xl">
        Preview:
      </span>
    </div>
    <div class="w-full h-[92%] rounded-xl overflow-hidden">
      <RootComp bind:options={rootArgs}/>
    </div>
  </div>

  <div class="w-full h-[40%] flex flex-col flex-shrink-0">
    <div class="w-full h-[50%] flex flex-col justify-start">
      {@render ComponentList("Layout components:", [
        {
          attachable: (node) => {
            node.onmousedown = () => {handleMouseDown(node, 'WizardPanel')};
            node.onmouseup = () => handleMouseOutLayoutComp(() => wizardPipPosition = (wizardPipPosition + 1) % 4)
          },
          display: WizardContents,
          displayArgs: {}
        },
        {
          attachable: (node) => {
            node.onmousedown = () => handleMouseDown(node, 'SplitPanel'),
            node.onmouseup = () => handleMouseOutLayoutComp(() => isResizablePipRotated = !isResizablePipRotated)
          },
          display: SplitPaneContents,
          displayArgs: {}
        }
      ])}
    </div>
    <div class="w-full h-[50%] flex flex-col justify-start">
      {@render ComponentList("Layout components:", Object.keys(registeredComponents).map<ComponentPipConfig>((key) => {
        return {
          attachable: (node) => {
            node.onmousedown = () => {
              handleMouseDown(node, key as ComponentType);
            }
          },
          display:  TerminalContents, 
          displayArgs:  { componentType: key }
        }
      }))}
    </div>
  </div>
  <div class="w-full h-[10%] flex flex-col px-6 py-3 flex-shrink-0">
    <div class="w-full h-full bg-ide-card flex justify-end items-center">
      <button class="h-[80%] w-[15%] bg-[#434343] rounded-xl text-2xl hover:cursor-pointer" onclick="{saveTree}">save</button>
    </div>
  </div>
</main>

{#snippet ComponentList(label: string, displayablePips: ComponentPipConfig[])}
  <div class="w-full h-full flex flex-col justify-start">
    <div class="w-full h-[25%] items-center bg-ide-card flex justify-start">
      <span class="flex justify-start items-center text-xl px-10">{label}</span>
    </div>
    <div class="w-full h-[75%] flex justify-start px-10 py-2 gap-5 bg-ide-dcard">
      {#each displayablePips as pip}
        {@render draggablePip(pip.attachable, pip.display, pip.displayArgs)}
      {/each}
    </div>
  </div>
{/snippet}

{#snippet TerminalContents(args: { componentType: string })}
  <div class="w-full bg-[#434343] h-full rounded-lg overflow-hidden flex flex-col justify-center items-center">
    {#await import(`/src/lib/svg/EditorComponentIcons/${args.componentType}IconSvg.svelte`)}
      <PlaceholderPanelIconSvg options={{color: "#ffffff", class: "w-24 h-24"}}/>
    {:then module} 
      {@const Svg: Component<{options: svgArg}, {}, ""> = module.default}
      <Svg options={{color: "#ffffff"}}/>
      <span class="w-full flex justify-center items-center text-lg">{args.componentType}</span>
    {/await}
  </div>
{/snippet}

{#snippet WizardContents()}
  <div class="w-full h-full bg-[#434343] flex {wizardPipPosition === 0 ? 'flex-col justify-start' : ''} {wizardPipPosition === 1 ? 'flex justify-end' : ''} {wizardPipPosition === 2 ? 'flex-col-reverse justify-start' : ''} {wizardPipPosition === 3 ? 'justify-start' : ''} items-center">
    <div class="w-4 h-4 bg-red-500"></div>
  </div>
{/snippet}

{#snippet SplitPaneContents()}
  <div class="w-full h-full bg-transparent flex transition-transform duration-200 ease-out {isResizablePipRotated ? 'rotate-90' : ''}">
    <div class="w-[50%] h-full border-2 bg-[#434343] rounded-md border-red-500"></div>
    <div class="w-[50%] h-full border-2 bg-[#434343] rounded-md border-red-500"></div>
  </div>
{/snippet}

{#snippet draggablePip(attachable: (elem: HTMLButtonElement) => void, display: Snippet<[any]>, diplayArgs: object)}
  <div class="w-[15%] h-full">
    <div class="w-full h-full p-2 flex border-2 border-red-500 rounded-xl">
      <button {@attach attachable} class="flex-grow rounded-lg">
        {@render display(diplayArgs)}
      </button>
    </div>
  </div>
{/snippet}