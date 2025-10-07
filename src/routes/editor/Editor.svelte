<script lang="ts">
  import { ComponentRegistry } from "./ComponentRegistry";

	import type { ComponentConfig, MyTopLevelComponentArg, ResizeAxis, ComponentType, tabSide } from "./ResizableComponentArg";
	import type { InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from "$lib/types/ComponentLoadArgs";
	import type { CodeEditorArg } from "$lib/types/CodeEditorArg";
	import type { Component } from "svelte";
	import type { Problem } from "$lib/types/Problem";
	import { saveLayout, userEditorLayoutPreferences } from "$lib/stores/theme";

  let { data } : { data: { hideHeader: boolean, data: Problem } } = $props();
  
  let problem: Problem = $derived(data.data);

  let wizardPipPosition: number = $state(0);

  let availableLayouts: Record<string, string> = $state({});

  userEditorLayoutPreferences.subscribe((pref) => {
    availableLayouts = pref.layouts
  })
  
  let terminalArg: TerminalComponentArgs = $state({
    terminalContents: ''
  });

  let infoPanelArg: InfoPanelComponentArgs = $state({
    problem: problem
  });
  let testCaseArgs: TestCaseComponentArgs = $state({
    testCases: problem.testCases,
  });

  let editorContents: CodeEditorArg = $state({
    editorContents: problem.templateContents, 
    fontSize: 16
  });

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


  type coords = {
    x: number,
    y: number,
  }

  let isResizablePipRotated: boolean = $state(false);

  type draggingData = {
    isDragging: boolean,
    draggedButton: HTMLButtonElement | undefined,
    initCoords: coords | undefined,
    draggedTileType: ComponentType | undefined,
  }

  let resizableComp: HTMLButtonElement;
  let wiardComp: HTMLButtonElement;

  let blueComp: HTMLButtonElement;
  let amberComp: HTMLButtonElement;
  let redComp: HTMLButtonElement;
  let greenComp: HTMLButtonElement;

  let lastMouseX: number | null = null;
  let lastMouseY: number | null = null;

  let dragging: draggingData = $state({
    isDragging: false,
    draggedButton: undefined,
    initCoords: undefined,
    draggedTileType: undefined,
  });

  const handleMouseDown = (button: HTMLButtonElement, type: ComponentType) => {
		dragging.isDragging = true;
    dragging.draggedButton = button;
    dragging.draggedButton.style.position = 'fixed';
    dragging.draggedTileType = type;

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', dragging.draggedTileType === 'SplitPanel' ? handleMouseUpResize :  handleMouseUp);

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

      if (isResizablePipRotated && dragging.draggedTileType === 'SplitPanel'){
        dragging.draggedButton.style.transform = `translateX(${dy}px) translateY(${-dx}px)`;
      }else{
        dragging.draggedButton.style.transform = `translateX(${dx}px) translateY(${dy}px)`;
      }

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    }
	};

  const handleMouseUpResize = (e: MouseEvent): void => {
    if (!dragging.initCoords || (Math.abs(dragging.initCoords?.x - e.clientX) < 5 && Math.abs(dragging.initCoords?.y - e.clientY) < 5)){
      isResizablePipRotated = !isResizablePipRotated;
    }

    handleMouseUp();
  }

  const handleMouseUp = () => {
    if (dragging.draggedButton){
      dragging.draggedButton.style.position = '';
      dragging.draggedButton.style.transform = '';
      document.body.style.cursor = '';
		  document.body.style.userSelect = '';
    }

    checkCollisionWithPossibleTargets({x: lastMouseX!, y: lastMouseY!})    


    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseup', handleMouseUpResize);

    dragging = {
      isDragging: false,
      draggedButton: undefined,
      initCoords: undefined,
      draggedTileType: undefined,
    }
		lastMouseX = null;
		lastMouseY = null;
	};


  let rootCompType: ComponentType = $state('TopLevelComponent');
  let RootComp: Component<any> = $derived(ComponentRegistry.get(rootCompType)!);

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
    switch (windowType){
      case 'TestCases':
        target.component = 'TestCases';
        target.options = testCaseArgs;
        break;
      case 'InfoPanel':
        target.component = 'InfoPanel';
        target.options = infoPanelArg;
        break;
      case 'Terminal':
        target.component = 'Terminal';
        target.options = terminalArg;
        break;
      case 'Editor':
        target.component = 'Editor'
        target.options = editorContents;
        break;
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

  const checkCollisionWithPossibleTargets = (cursorPosition: coords): void => {
    for (let i = availableTargets.length - 1; i >= 0; i--){
      if (isCursorWithinBounds(cursorPosition, availableTargets[i].wrapper) && getComputedStyle(availableTargets[i].wrapper!).visibility === 'visible'){
        makeTargetIntoComponent(availableTargets[i].target);
        break;
      }
    }
  }

  const isCursorWithinBounds = (cursorPosition: coords, div: HTMLDivElement | undefined) => {
    if (!div) return false;
    const divDomRect: DOMRect = div.getBoundingClientRect();
    return (cursorPosition.x >= divDomRect.left && cursorPosition.x <= divDomRect.right && cursorPosition.y >= divDomRect.top && cursorPosition.y <= divDomRect.bottom)
  }

</script>

<main class="w-full h-full flex flex-col justify-start items-center">
  <button class="fixed top-3 left-3 border-2 border-black rounded-lg w-64 h-32" onclick="{saveTree}">save</button>
  <div class="w-full  h-[60%] flex justify-center">
    <div class="w-[60%] h-full rounded-xl overflow-hidden">
      <RootComp bind:options={rootArgs}/>
    </div>
  </div>

  <div class="w-full h-[40%] flex flex-col">
    <div class="w-full h-[50%] p-5 flex justify-center gap-10">
      {@render ResizablePip()}
      {@render WizardPip()}
    </div>
    <div class="w-full h-[50%] p-5 flex justify-center gap-10">
      <div class="w-72 h-36"><button bind:this={redComp} class="w-72 h-36 bg-red-500 rounded-md border-2 border-black" onmousedown="{()=>{handleMouseDown(redComp, 'InfoPanel')}}" aria-label="red">info panel</button></div>
      <div class="w-72 h-36"><button bind:this={greenComp} class="w-72 h-36 bg-green-500 rounded-md border-2 border-black" onmousedown="{()=>{handleMouseDown(greenComp, 'Terminal')}}" aria-label="green">terminal</button></div>
      <div class="w-72 h-36"><button bind:this={blueComp} class="w-72 h-36 bg-blue-500 rounded-md border-2 border-black" onmousedown="{()=>{handleMouseDown(blueComp, 'TestCases')}}" aria-label="blue">test cases</button></div>
      <div class="w-72 h-36"><button bind:this={amberComp} class="w-72 h-36 bg-amber-500 rounded-md border-2 border-black" onmousedown="{()=>{handleMouseDown(amberComp, 'Editor')}}" aria-label="blue"> editor</button></div>
    </div>
  </div>
</main>

{#snippet ResizablePip()}
  <div class="w-40 h-24 p-1 bg-[#434343] rounded-md ">
      <button bind:this={resizableComp} class="w-38 h-22 rounded-md border-2 flex border-black {!dragging.isDragging ?  'transition-transform duration-200 ease-out' : ''} {isResizablePipRotated ? 'rotate-90' : ''}" onmousedown="{()=>{handleMouseDown(resizableComp, 'SplitPanel')}}" aria-label="resizable-pip">
        <div class="w-19 h-22 border-2 border-black"></div>
        <div class="w-19 h-22 border-2 border-black"></div>
      </button>
  </div>
{/snippet}

{#snippet WizardPip()}
  <div class="w-40 h-24 p-1 bg-[#434343] rounded-md ">
      <button bind:this={wiardComp} class="w-38 h-22 rounded-md border-2 flex border-black" onclick="{()=>{wizardPipPosition = (wizardPipPosition + 1) % 4}}" onmousedown="{()=>{handleMouseDown(wiardComp, 'WizardPanel')}}" aria-label="resizable-pip">
        <div class="w-38 h-22 flex {wizardPipPosition === 0 ? 'flex-col justify-start' : ''} {wizardPipPosition === 1 ? 'flex justify-end' : ''} {wizardPipPosition === 2 ? 'flex-col-reverse justify-start' : ''} {wizardPipPosition === 3 ? 'justify-start' : ''} items-center">
          <div class="w-4 h-4 bg-red-500"></div>
        </div>
      </button>
  </div>
{/snippet}