<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

  import { userPreferences } from "../../../../../../Stores/theme";
  import { parseComputedDimensions, parseOptionalDimensions } from "../../../../../../Utils/index";
	import HelperDuck from "../../../../../../Components/CodingPageComponents/HelperDuck.svelte";
	import type { Problem, TestCase } from "../../../../../../Types/Categories/Problem";
	import type { ExecResponse } from "../../../../../../Types";
	import Chevron from "./chevron.svelte";

  let { data } : {data: Problem} = $props();

  let userCode: string = $state(data.templateContents);

  let isDraggingHorizontal: boolean = $state(false);
  let isDraggingVertical: boolean = $state(false);

  let isHorizontalResized: boolean = false;
  let isVerticalResized: boolean = false;
  let wasClicked: boolean = false;
  let isDataDivSnappedToLeft = false;
  let isTerminalDivSnappedToBottom = false;

  let theme: string = $state("light");

  let originalWidthLeft: number;
  let originalWidthRight: number;
  
  let originalHeightTop: number;
  let originalHeightBottom: number;
  
  let contentPaneClientStartX: number;
  let contentPaneClientStartY: number;
  
  let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
  let monaco: typeof Monaco | null = null;
  let editorContainer: HTMLElement;
  
  let dataDiv: HTMLElement = $state(document.createElement("div"));
  let terminalDiv: HTMLElement = $state(document.createElement("div"));
  let terminalContents: HTMLElement = $state(document.createElement("div"));
  
  let mainDiv: HTMLElement;
  let codeDiv: HTMLElement;
  let monacoDiv: HTMLElement;
  let resizeBarVerticalDiv: HTMLElement;
  let resizeBarHorizontalDiv: HTMLElement;
  let verticalResizeBarAccent: HTMLElement;
  let verticalResizeBar: HTMLElement;
  let horizontalResizeBarAccent: HTMLElement;
  let resizeVerticalButton: HTMLElement; // TODO come up with a better name here
  let resizeHorizontalButton: HTMLElement; // TODO come up with a better name here

  let allTestCasesToggleChevron: HTMLDivElement | undefined = $state();
  let publicTestCasesToggleChevron: HTMLDivElement | undefined = $state();
  let privateTestCasesToggleChevron: HTMLDivElement | undefined = $state();
  
  let horizontalResizeBar: HTMLElement;

  let htmlDescriptionDiv: HTMLElement;
  let htmlControlDiv: HTMLElement;

  let htmlDescriptionDivChevron: SVGSVGElement;
  let htmlControlDivChevron: SVGSVGElement;

  let htmlTestCaseDirectoryDiv: HTMLElement | null = $state(null);
  let htmlPublicTestCaseDirectoryDiv: HTMLElement | null = $state(null);
  let htmlPrivateTestCaseDirectoryDiv: HTMLElement | null = $state(null);

  const defaultTileHeight: number = 40; 

  let waitingForServerResponse: boolean = $state(false);
  let serverResponse: ExecResponse | null = $state(null);

  let terminalContentsString: string = $state("~/>");

  let testCases: TestCase[] = $state(data.testCases);
  let testCasesMappedById: Map<string, TestCase> = $derived.by(()=>{
    const tmp: Map<string, TestCase> = new Map();
    testCases.forEach(tc => tmp.set(tc.testCaseId, tc));
    return tmp;
  });

  let previewedTestCase: TestCase | undefined = $state(data.testCases.at(0));

  const horizontalResizeBarComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!horizontalResizeBar) return undefined;
    return getComputedStyle(horizontalResizeBar);
  });


  const unsubscribe = userPreferences.subscribe(value => {
    theme = value.theme;
  })

  $effect(() => {
    /* 
    TODO find something more elegant, this reassignment is necessary as is since $effect() triggers when any state referenced in it's body changes.
    For some reason the theme passed to getMonacoTheme() does not count as a referenced state???
     */
    theme = theme;
    terminalDiv.style.background = theme === "light" ? "#fffffe" : "#1e1e1e";
    monaco?.editor.setTheme(getMonacoTheme(theme));
  });

  const getMonacoTheme = (passedTheme: string) => {
    switch (passedTheme) {
      case 'light':
        return "vs";
      case 'dark':
        return "vs-dark"; 
      default:
        return "vs";
    }
  }

  onMount(async () => {
    toggleTile(htmlDescriptionDiv, htmlDescriptionDivChevron, defaultTileHeight, 400);
    toggleTile(htmlControlDiv, htmlControlDivChevron, defaultTileHeight, 100)
    calculateMountedSizing();
    setupDynamicElementSizing();
    try {      
      monaco = (await import("../../../../../../Utils/monaco")).default;
      
      if (!editorContainer || !monaco) return;

      editor = monaco.editor.create(editorContainer, {
        value: userCode,
        language: "java",
        theme: getMonacoTheme(theme),
        minimap: {
          enabled: false
        },
        readOnly: false,
        automaticLayout: true,
      });
    } catch (error) {
      console.error(error);
    } 
  });


  onDestroy(() => {
    try {
      if (editor) {
        editor.dispose();
        editor = null;
      }
      
      if (monaco) {
        monaco.editor.getModels().forEach((model) => {
          model.dispose();
        });
      }
    
    } catch (error) {
      console.error(error);
    } finally {
      unsubscribe();
    }
  });

  const calculateMountedSizing = () : void => {
    originalWidthLeft  = parseComputedDimensions(getComputedStyle(dataDiv).width);
    originalWidthRight = parseComputedDimensions(getComputedStyle(codeDiv).width);
    originalHeightTop = parseComputedDimensions(getComputedStyle(monacoDiv).height);
    originalHeightBottom = parseComputedDimensions(getComputedStyle(terminalDiv).height);

    const autoGeneratedSuperMain: HTMLElement | null = mainDiv.parentElement;
    if (!autoGeneratedSuperMain) return;
    const boundingRec: DOMRect = autoGeneratedSuperMain.getBoundingClientRect();

    contentPaneClientStartX = boundingRec.x + parseComputedDimensions(getComputedStyle(autoGeneratedSuperMain).marginLeft) + parseComputedDimensions(getComputedStyle(autoGeneratedSuperMain).paddingLeft) + parseComputedDimensions(getComputedStyle(mainDiv).paddingLeft) + parseComputedDimensions(getComputedStyle(mainDiv).marginLeft);
    contentPaneClientStartY = boundingRec.y + parseComputedDimensions(getComputedStyle(autoGeneratedSuperMain).marginTop) + parseComputedDimensions(getComputedStyle(autoGeneratedSuperMain).paddingTop) + parseComputedDimensions(getComputedStyle(mainDiv).marginTop) + parseComputedDimensions(getComputedStyle(mainDiv).paddingTop);
  }

  const setupDynamicElementSizing = () : void => {
    const actualScrollBarVertical: HTMLElement = resizeBarVerticalDiv.childNodes[0] as HTMLElement;
    const actualScrollBarHorizontal: HTMLElement = resizeBarHorizontalDiv.childNodes[0] as HTMLElement;

    actualScrollBarVertical.style.width = getComputedStyle(resizeBarVerticalDiv).width;
    actualScrollBarHorizontal.style.height = getComputedStyle(resizeBarHorizontalDiv).height;

    actualScrollBarVertical.style.left = "50%";
    actualScrollBarHorizontal.style.left = "50%";
    actualScrollBarVertical.style.transform = `translate(-50%)`;
    actualScrollBarHorizontal.style.transform = `translate(-50%)`;
  }

  const toggleTile = (elementToToggle: HTMLElement, chevron: SVGSVGElement,  defaultHeight: number, expandedHeight: number) => {
    chevron.style.transition = 'all 0.3s ease';
    if (!(chevron.style.rotate === "180deg")){
      expandTile(elementToToggle, expandedHeight);
      chevron.style.rotate = "180deg"
    }else{
      shrinkTile(elementToToggle, defaultHeight);
      chevron.style.rotate = "0deg"
    }
  };

  const expandTile = (elementToToggle: HTMLElement, expandedHeight: number) => {
    elementToToggle.style.height = `${expandedHeight}px`;
    elementToToggle.style.transition = 'all 0.3s ease';
  }
  
  const shrinkTile = (elementToToggle: HTMLElement, defaultHeight: number) => {
    elementToToggle.style.height = `${defaultHeight}px`;
  }


  const getCurrentContent = (): string => {
    if (!editor) return '';
    return editor.getValue();
  }

  const executeCode = async () : Promise<void> => {
    const userContent: string = getCurrentContent();
    startTime = new Date().getTime();
    raf = requestAnimationFrame(animateSubmission);
    waitingForServerResponse = true;
    const result = await fetch("http://localhost:8080/api/Executor/dry",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        CodeB64: `${btoa(userContent)}`,
        Lang: "java",
        ExerciseId: data.problemId,
      })
    });

    serverResponse = await result.json();
    endTime = new Date().getTime();
    waitingForServerResponse = false;    
  }


  let startTime: number;
  let endTime: number;

  const submitCode = async () : Promise<void> => {
    const userContent: string = getCurrentContent();
    startTime = new Date().getTime();
    raf = requestAnimationFrame(animateSubmission);
    waitingForServerResponse = true;
    const result = await fetch("http://localhost:8080/api/Executor/full",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        CodeB64: `${btoa(userContent)}`,
        Lang: "java",
        ExerciseId: data.problemId,
      })
    });
    serverResponse = await result.json();
    if (serverResponse){
      serverResponse.testResults.forEach(tcr => {
        if (testCasesMappedById.has(tcr.testId)){
          testCasesMappedById.get(tcr.testId)!.isPassed = tcr.isTestPassed;
        }
      });
    }
    endTime = new Date().getTime();
    waitingForServerResponse = false;    
  }

  const handleDownHorizontal = (e: MouseEvent) => {
    e.preventDefault();
    isDraggingHorizontal = true;
    document.addEventListener('mousemove', handleMouseDraggedHorizontal);
    document.addEventListener('mouseup', handleReleaseHorizontal);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none"; 
  }

  const handleDownVertical = (e: MouseEvent) => {
    e.preventDefault();
    isDraggingVertical = true;
    document.addEventListener('mousemove', handleMouseDraggedVertical);
    document.addEventListener('mouseup', handleReleaseVertical);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none"; 
  }


  const handleMouseDraggedHorizontal = (e: MouseEvent) => {
    if (!isDraggingHorizontal) return;
    const dx = originalWidthLeft + contentPaneClientStartX - e.clientX;
    let newDataDivWidth: number = originalWidthLeft - dx;
    let newCodeDivWidth: number = originalWidthRight + dx;
    // TODO magic number, make this relative or a const, could be percentage of DOMRect but considering how often this fires that seems unwise
    if (newDataDivWidth < 50){
      newCodeDivWidth += newDataDivWidth;
      newDataDivWidth = 0;
      handleReleaseHorizontal();
      hideVerticalBarWrapper();
      isDataDivSnappedToLeft = true;
      resizeVerticalButton.style.visibility = "visible";
    }
    dataDiv.style.width = `${newDataDivWidth}px`;
    codeDiv.style.width = `${newCodeDivWidth}px`;   
  }

  const handleMouseDraggedVertical = (e: MouseEvent) => {
    if (!isDraggingVertical) return;
    const dy = originalHeightTop + contentPaneClientStartY - e.clientY;
    let newMonacoDivHeight: number = originalHeightTop - dy;
    let newTerminalDivHeight: number = originalHeightBottom + dy;
    if (newTerminalDivHeight < 50){
      newMonacoDivHeight += newTerminalDivHeight;
      newTerminalDivHeight = 0;
      handleReleaseVertical();
      hideHorizontalBarWrapper()
      isTerminalDivSnappedToBottom = true;
      resizeHorizontalButton.style.visibility = "visible";
    }
    monacoDiv.style.height = `${newMonacoDivHeight}px`;
    terminalDiv.style.height = `${newTerminalDivHeight}px`;
  }

  const handleReleaseHorizontal = () => {
    isDraggingHorizontal = false;

    document.removeEventListener('mousemove', handleMouseDraggedHorizontal);
    document.removeEventListener('mouseup', handleReleaseHorizontal);
    document.body.style.cursor = "auto";
    document.body.style.userSelect = "auto";

    wasClicked = true;
  }

  const handleReleaseVertical = () => {
    isDraggingVertical = false;

    document.removeEventListener('mousemove', handleMouseDraggedVertical);
    document.removeEventListener('mouseup', handleReleaseVertical);
    document.body.style.cursor = "auto";
    document.body.style.userSelect = "auto";

    wasClicked = true;

  }

  const toggleVerticalWindowResizeBarResized = () => {
    if (isDraggingHorizontal) return;
    const resize_bar_width = parseComputedDimensions(getComputedStyle(verticalResizeBar).width);
    if (!isVerticalResized){
      verticalResizeBar.style.width = `${resize_bar_width * 3}px`
      isVerticalResized = true;
      verticalResizeBarAccent.style.visibility = "visible";

      if(theme === "dark"){
        verticalResizeBar.style.background = "rgba(255,255,255,0.35)";
      }else{
        verticalResizeBar.style.background = "rgba(0,0,0,0.65)";
      }
    }else {
      isVerticalResized = false;
      verticalResizeBar.style.background = "var(--color-bg)";
      verticalResizeBar.style.width = `${resize_bar_width / 3}px`
      verticalResizeBarAccent.style.visibility = "hidden";

    }
    verticalResizeBar.style.left = "50%";
    verticalResizeBar.style.transform = `translate(-50%)`;  
  }

  const toggleHorizontalWindowResizeBarResized = () => {
    if (isDraggingVertical) return;
    const resize_bar_height = parseOptionalDimensions(horizontalResizeBarComputedStyle?.height);
    if (!isHorizontalResized){
      isHorizontalResized = true;
      horizontalResizeBar.style.height = `${resize_bar_height * 3}px`
      horizontalResizeBarAccent.style.visibility = "visible";
      if(theme === "dark"){
        horizontalResizeBar.style.background = "rgba(255,255,255,0.35)";
      }else{
        horizontalResizeBar.style.background = "rgba(0,0,0,0.65)";
      }
    }else{
      isHorizontalResized = false;
      horizontalResizeBar.style.height = `${resize_bar_height / 3}px`;
      horizontalResizeBar.style.background = "var(--color-bg)";
      horizontalResizeBarAccent.style.visibility = "hidden";
    }
    horizontalResizeBar.style.top = "50%";
    horizontalResizeBar.style.transform = `translate(-50%)`; 
  }

  const expandVerticalBarWrapper = ()=>{
    if (!isDataDivSnappedToLeft){
      if (isHorizontalResized && !isDraggingHorizontal){
        handleReleaseVertical();
        toggleHorizontalWindowResizeBarResized();      
      }else{
        toggleVerticalWindowResizeBarResized();
      }
    }
  }

  const hideVerticalBarWrapper = () => {
    if(!isDataDivSnappedToLeft){
      if(!isDraggingHorizontal && !isDraggingVertical && wasClicked){
        wasClicked = false;
        if (isVerticalResized){
          toggleVerticalWindowResizeBarResized();      
        }
      }else{
        toggleVerticalWindowResizeBarResized();
      }
    }
  }

  const expandHorizontalBarWrapper = ()=>{
    if (!isTerminalDivSnappedToBottom){
      if (isVerticalResized && !isDraggingVertical){
        handleReleaseHorizontal();
        toggleVerticalWindowResizeBarResized()
      }
      toggleHorizontalWindowResizeBarResized();
    }
  }

  const hideHorizontalBarWrapper = ()=>{
    if(!isTerminalDivSnappedToBottom){
      if (!isDraggingVertical && !isDraggingHorizontal && wasClicked){
        wasClicked = false;
        if(isHorizontalResized){
          toggleHorizontalWindowResizeBarResized();
        }
      }else{
        toggleHorizontalWindowResizeBarResized();
      }
    }
  }

  const returnInfoDiv = (): void => {
    const bodyRect: DOMRect = document.body.getBoundingClientRect();
    dataDiv.style.width = `${bodyRect.width * 0.2}px`;
    codeDiv.style.width = `${bodyRect.width * 0.8}px`;
    resizeVerticalButton.style.visibility = "hidden";
    isDataDivSnappedToLeft = false;
  }

  const returnTerminalDiv = () : void => {
    const codeDivComputedDim: CSSStyleDeclaration = getComputedStyle(codeDiv);
    monacoDiv.style.height = `${parseComputedDimensions(codeDivComputedDim.height) * 0.85}px`;
    terminalDiv.style.height = `${parseComputedDimensions(codeDivComputedDim.height) * 0.15}px`;
    resizeHorizontalButton.style.visibility = "hidden";
    isTerminalDivSnappedToBottom = false;
  }

  let frameCounter: number  = 0;
  let raf: number;
  let dotCounter: number = 0;

  const animateSubmission = () => {
    if (waitingForServerResponse){
      if (frameCounter % 25 == 0){
        frameCounter = 0;
        dotCounter++;
        dotCounter %= 4;
        terminalContentsString = `Executing${".".repeat(dotCounter)}`;
      }
      frameCounter++;
      raf = requestAnimationFrame(animateSubmission);
    }else{
      cancelAnimationFrame(raf);
      if (serverResponse){     
        // TODO this is meant to use error codes not this shitty string checking but the distributed nature of the executino pipeline will make it sligthly more time consuming than I can bare atm
        if (serverResponse.stdError !== ""){
          terminalContentsString = `${serverResponse.stdError}`;
        } else{
          terminalContentsString = `Total execution time: ${endTime - startTime}ms\nReal execution time: ${serverResponse.executionTime}ms (gotta make it more precise by not using linux "time")\n`;
        }  
      }
      setTimeout(()=>{
        terminalContentsString = `${terminalContentsString}\n${serverResponse!.stdOutput}`;
      }, 1000);
    }
  }

  let isTerminalShown: boolean = $state(true);
  let isTestCaseContainerShown: boolean = $state(false);


  // TODO could this use cleaning up? Yes. Emphatically. Am I gonna do it now? ... No
  const toggleTestCaseContainer = () => {
    if (!htmlTestCaseDirectoryDiv || !allTestCasesToggleChevron) return;
    const htmlTestCaseDirectoryDivComputedStyle: CSSStyleDeclaration = getComputedStyle(htmlTestCaseDirectoryDiv);
    if (htmlTestCaseDirectoryDivComputedStyle.height === "0px"){
      allTestCasesToggleChevron.style.transform = ""
      htmlTestCaseDirectoryDiv.style.height = "";
    }else{
      allTestCasesToggleChevron.style.transform = "rotate(-90deg)"
      htmlTestCaseDirectoryDiv.style.height = "0px";
    }
  }

  const togglePublicTestCaseDiv = () => {
    if (!htmlPublicTestCaseDirectoryDiv || !publicTestCasesToggleChevron) return;
    const htmlPublicTestCaseDirectoryDivComputedStyle: CSSStyleDeclaration = getComputedStyle(htmlPublicTestCaseDirectoryDiv);
    if (htmlPublicTestCaseDirectoryDivComputedStyle.height === "0px"){
      htmlPublicTestCaseDirectoryDiv.style.height = "";
      publicTestCasesToggleChevron.style.transform = ""
    }else{
      htmlPublicTestCaseDirectoryDiv.style.height = "0px";
      publicTestCasesToggleChevron.style.transform = "rotate(-90deg)"
    }
  }

  const togglePrivateTestCaseDiv = () => {
    if (!htmlPrivateTestCaseDirectoryDiv || !privateTestCasesToggleChevron) return;
    const htmlPrivateTestCaseDirectoryDivComputedStyle: CSSStyleDeclaration = getComputedStyle(htmlPrivateTestCaseDirectoryDiv);
    if (htmlPrivateTestCaseDirectoryDivComputedStyle.height === "0px"){
      htmlPrivateTestCaseDirectoryDiv.style.height = "";
      privateTestCasesToggleChevron.style.transform = ""
    }else{
      htmlPrivateTestCaseDirectoryDiv.style.height = "0px";
      privateTestCasesToggleChevron.style.transform = "rotate(-90deg)"
    }
  }
</script>

<main bind:this={mainDiv} class="flex h-[94vh] w-full bg-[var(--color-bg)]">
  <button bind:this={resizeVerticalButton} class="h-[20%] w-6 rounded-r-md bg-[var(--color-tile)] border-2 border-[var(--color-primary)] border-l-0 fixed left-0 top-[40%] invisible z-999 flex flex-col justify-center items-center hover:cursor-pointer" onclick={returnInfoDiv}>
    <div class="transform rotate-90 origin-center flex justify-start">
      <div class="mx-3">
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8.2C3 7.07989 3 6.51984 3.21799 6.09202C3.40973 5.71569 3.71569 5.40973 4.09202 5.21799C4.51984 5 5.0799 5 6.2 5H9.67452C10.1637 5 10.4083 5 10.6385 5.05526C10.8425 5.10425 11.0376 5.18506 11.2166 5.29472C11.4184 5.4184 11.5914 5.59135 11.9373 5.93726L12.0627 6.06274C12.4086 6.40865 12.5816 6.5816 12.7834 6.70528C12.9624 6.81494 13.1575 6.89575 13.3615 6.94474C13.5917 7 13.8363 7 14.3255 7H17.8C18.9201 7 19.4802 7 19.908 7.21799C20.2843 7.40973 20.5903 7.71569 20.782 8.09202C21 8.51984 21 9.0799 21 10.2V15.8C21 16.9201 21 17.4802 20.782 17.908C20.5903 18.2843 20.2843 18.5903 19.908 18.782C19.4802 19 18.9201 19 17.8 19H6.2C5.07989 19 4.51984 19 4.09202 18.782C3.71569 18.5903 3.40973 18.2843 3.21799 17.908C3 17.4802 3 16.9201 3 15.8V8.2Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div>Details</div>  
    </div>
</button>

  <HelperDuck/>

  <div bind:this={dataDiv} class="flex flex-col text-center w-[30%] h-full overflow-hidden border-r-2 border-[#e6e6e6]">
  <div class="flex justify-center text-l items-center w-full h-[20%]">
    <span class="m-2">
      {data.title}
    </span>
  </div>
    <div class="w-full h-[80%] py-2 px-1 bg-[var(--color-tile)] text-xs overflow-scroll">
      {@render SidePanel()}
    </div>
  </div> 

  <button bind:this={resizeBarVerticalDiv} class="w-1 h-full relative overflow-visible" class:hover:cursor-col-resize={!isDraggingHorizontal} onmouseenter={expandVerticalBarWrapper} onmouseleave={hideVerticalBarWrapper} onmousedown={handleDownHorizontal} onmouseup={handleReleaseHorizontal} aria-label="resize-bar">
    <div bind:this={verticalResizeBar} class="h-full left-0 top-0 absolute flex flex-col justify-center items-center rounded-full">
      <div bind:this={verticalResizeBarAccent} class="w-1 h-25 bg-[var(--color-accent-1)] rounded-full none invisible"></div>
    </div>
  </button>

  {@render CodingComponent()}
</main>


{#snippet SidePanel()}
  <div bind:this={htmlDescriptionDiv} class="w-full h-10 rounded-t-md overflow-hidden">
    <button class="w-full h-10 bg-[var(--color-bg)] px-5 flex items-center justify-between hover:cursor-pointer" onclick={() => toggleTile(htmlDescriptionDiv, htmlDescriptionDivChevron, defaultTileHeight, 400)}> 
        <span style="user-select: none;">Description</span>
        <svg bind:this={htmlDescriptionDivChevron} class="fill-white h-6 w-6" viewBox="0 0 407.437 407.437"><polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "/></svg> <!-- TODO placeholder so chill out Maja -->
    </button>
    <div class="w-full h-90 bg-[var(--color-bg)] flex flex-col justify-between">
      <div class="bg-[var(--color-bg)] h-[90%] flex justify-start p-3">
        <p>{data.description}</p>
      </div>
      <div class="flex justify-end items-center bg-[var(--color-bg)] h-[10%] p-3 mx-5 border-t-2 border-[var(--color-accent-1)]">
        {#each ["tag 1", "tag 2", "tag 3"] as tag}
          <p class="mx-1">{`#${tag}`}</p>
        {/each}
      </div>  
      
    </div>
  </div>
  <div bind:this={htmlControlDiv} class="w-full h-10 rounded-b-md overflow-hidden">
    <button class="w-full h-10 bg-[var(--color-bg)] px-5 flex items-center justify-between hover:cursor-pointer" onclick={() => toggleTile(htmlControlDiv, htmlControlDivChevron, defaultTileHeight, 100)}> 
        <span class="select-none">Control</span>
        <svg bind:this={htmlControlDivChevron} class="fill-white h-6 w-6" viewBox="0 0 407.437 407.437"><polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "/></svg>
    </button>
    <div class="w-full h-15 p-2 bg-[var(--color-bg)] flex justify-center">
      <button class="w-[50%] hover:cursor-pointer rounded-l-md h-full flex justify-center items-center bg-[var(--color-tile)] border-2 border-r-1 border-[var(--color-primary)]"
        onclick={executeCode}
      >
        <span style="user-select: none;">Execute</span> 
      </button>
      <button class="w-[50%] hover:cursor-pointer rounded-r-md h-full flex justify-center items-center bg-[var(--color-tile)] border-2 border-l-1 border-[var(--color-primary)]"
        onclick={submitCode}
      >
        <span style="user-select: none;">Submit</span>
      </button>
      </div>
    </div>
{/snippet}


{#snippet CodingComponent()}
<div bind:this={codeDiv} class="w-full h-full flex flex-col relative">
      <div bind:this={monacoDiv} class="w-full h-[85%] overflow-hidden" bind:this={editorContainer}></div>
        <button bind:this={resizeBarHorizontalDiv}
          class="h-1 w-full relative overflow-visible"
          class:hover:cursor-row-resize={!isDraggingVertical}
          onmouseenter={expandHorizontalBarWrapper}
          onmouseleave={hideHorizontalBarWrapper}
          onmousedown={handleDownVertical}
          onmouseup={handleReleaseVertical}
          aria-label="resize-bar">
          <div bind:this={horizontalResizeBar} class="w-full absolute flex justify-center items-center rounded-full">
            <div bind:this={horizontalResizeBarAccent} class="w-25 h-1 bg-[var(--color-accent-1)] rounded-full none invisible"></div>
          </div>
        </button>
      <div bind:this={terminalDiv} class="w-full h-[15%] bg-[#1e1e1e] flex justify-center">
        <div class="w-[2.5%] h-full bg-[#181818] flex flex-col justify-start items-center py-3">
          <button class="w-[90%] aspect-square {isTerminalShown ? "bg-blue-500" : "bg-transparent"} {isTerminalShown ? "" :"hover:bg-[rgba(255,255,255,0.35)]"} mb-2 rounded-md" onclick="{()=>{isTerminalShown = true; isTestCaseContainerShown = false;}}" aria-label="terminal">t</button>
          <button class="w-[90%] aspect-square {isTestCaseContainerShown ? "bg-blue-500" : "bg-transparent"} {isTestCaseContainerShown ? "" :"hover:bg-[rgba(255,255,255,0.35)]"} mb-2 rounded-md" onclick="{()=>{isTerminalShown = false; isTestCaseContainerShown = true;}}" aria-label="test-cases">c</button>
        </div>
        {#if isTerminalShown}  
        <div class="w-[97.5%] h-full overflow-y-scroll overflow-x-clip px-4 py-2">
          <span bind:this={terminalContents} class="font-mono whitespace-pre-wrap">{terminalContentsString}</span>
        </div>
        {:else if isTestCaseContainerShown}
          <div class="w-[98%] h-full flex justify-start">
            <div class="w-[20%] h-full"> 
              <div class="w-full h-full bg-[#1e1e1e] text-[#d3d3d3] border-r-1 border-r-[#181818] select-none overflow-hidden">

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                 <!-- TODO rework this to comply with a11y i.e. add click handlers etc. -->
                <div onclick="{toggleTestCaseContainer}" class="w-full h-8 active:bg-[#2b7fff] rounded-md  flex justify-start items-center">
                  <div bind:this={allTestCasesToggleChevron} class="w-2 h-2 rotate-90 ml-2">
                    <Chevron/>
                  </div>
                  <span class="p-1 text-center">exercise testing</span>
                </div>

                <div bind:this={htmlTestCaseDirectoryDiv} class="h-full overflow-hidden">
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div class="flex-col overflow-hidden">
                    <div class="w-full h-8 active:bg-[#2b7fff] rounded-md flex justify-start items-center" onclick="{togglePublicTestCaseDiv}">
                      <div bind:this={publicTestCasesToggleChevron} class="ml-6 w-2 h-2 rotate-90">
                        <Chevron/>
                      </div>
                      <span class="p-1">public tests</span>
                    </div>
                    <div bind:this={htmlPublicTestCaseDirectoryDiv}>
                      {#each testCases.filter(tc=>tc.isPublic) as testCase, i (testCase.testCaseId)}
                        <div class="w-full h-8 active:bg-[#2b7fff] rounded-md" onclick="{()=>{previewedTestCase = testCase}}">
                          <span class="ml-12 p-1 {testCase.isPassed === null ? "" : testCase.isPassed ? "text-green-500" : "text-red-500"}">public test {i + 1}</span>
                        </div>
                      {/each}
                    </div>
                  </div>
  
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div class="flex-col overflow-hidden">
                    <div class="w-full h-8 active:bg-[#2b7fff] rounded-md flex justify-start items-center" onclick="{togglePrivateTestCaseDiv}">
                      <div bind:this={privateTestCasesToggleChevron} class="ml-6 w-2 h-2 rotate-90">
                        <Chevron/>
                      </div>
                      <span class="p-1">private tests</span>
                    </div>
                    <div bind:this={htmlPrivateTestCaseDirectoryDiv}>
                      {#each testCases.filter(tc=>!tc.isPublic) as testCase, i (testCase.testCaseId)}
                        <div class="w-full h-8 active:bg-[#2b7fff] rounded-md" onclick="{previewedTestCase = undefined}">
                          <span class="ml-12 p-1 {testCase.isPassed === null ? "" : testCase.isPassed ? "text-green-500" : "text-red-500"}">private test {i + 1}</span>
                        </div>
                      {/each}
                    </div>
                  </div>
                </div>
                
              </div>

            </div>


            <div class="w-[80%] h-full bg-[#1e1e1e] p-4">
              <div class="bg-transparent w-full h-full">
                {#if previewedTestCase && previewedTestCase.isPublic}
                  {@render PublicTestCaseCard(previewedTestCase)}
                {:else if !previewedTestCase}
                  {@render PrivateTestCard()}
                {/if}
              </div>
            </div>

          </div>
        {/if}
      </div>
      <button bind:this={resizeHorizontalButton} onclick={returnTerminalDiv} class="h-10 w-[20%] absolute right-[40%] bottom-0 z-50 rounded-t-md bg-[var(--color-tile)] border-2 border-[var(--color-primary)] border-b-0 flex flex-col justify-start items-center hover:cursor-pointer invisible">
        <div class="flex justify-center h-full w-full">
          <div class="h-10 w-10">
            <svg width="24px" height="24px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.792725 12.2929L5.08562 8.00002L0.792725 3.70712L2.20694 2.29291L7.91405 8.00002L2.20694 13.7071L0.792725 12.2929Z" fill="#FFFFFF"/>
            <path d="M7.00006 15H15.0001V13H7.00006V15Z" fill="#FFFFFF"/>
            </svg>
          </div>
          <span>Terminal</span>  
        </div>
      </button>
  </div>

{/snippet}


{#snippet PublicTestCaseCard(testCase: TestCase)}
  <main class="w-full h-full flex flex-col">
    <div class="w-full flex-1 overflow-auto flex flex-col items-center">
      {@render TestCaseDataCard("Test input:", testCase.display)}
      {@render TestCaseDataCard("Expected output:", testCase.displayRes)}
    </div>
    <!-- {#if testCase.isPassed !== null}
      <div class="w-full h-12 bg-green-300 flex-shrink-0 flex justify-start border-t-2 border-red-500">
        <span>Passed: {testCase.isPassed}</span>
      </div>
    {/if} -->
  </main>
{/snippet}

{#snippet PrivateTestCard()}
  <main class="w-full h-full flex flex-col justify-center items-center">
    <button onclick="{()=>{console.log("bought")}}">
      buy
    </button>
    <span>This test case is non public. You can however buy access to it for: {100}</span>
  </main>
{/snippet}

{#snippet TestCaseDataCard(label: string, textToDisplay: string)}
  <div class="w-[95%] h-12 bg-blue-950 flex justify-start flex-shrink-0 items-center text-center mt-2 rounded-md px-3 py-1 select-none">
    <span class="w-[25%] border-r-2 border-black">{label}</span>
    <span class="w-[75%]">{textToDisplay}</span>
  </div>
{/snippet}