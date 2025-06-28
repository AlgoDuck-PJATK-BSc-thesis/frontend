<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
  import type { ExerciseData } from "../../../../../../Types/ExerciseData";
  import { userPreferences } from "../../../../../../Stores/theme";
  import { parseComputedDimensions, findWrappingIndices, getOptionalDimesionsString, constGetOptionalDimensionsNumber, parseOptionalDimensions } from "../../../../../../Utils/index";

  let { data } : {data: ExerciseData} = $props();

  let userCode: string = $state(data.template);

  let isDraggingHorizontal: boolean = $state(false);
  let isDraggingVertical: boolean = $state(false);

  let isHorizontalResized: boolean = false;
  let isVerticalResized: boolean = false;
  let wasClicked: boolean = false;
  let isDuckContainerShown: boolean = false;
  let isHintBoxShown: boolean = false;

  let theme: string = $state("dark");

  let originalWidthLeft: number;
  let originalWidthRight: number;
  
  let originalHeightTop: number;
  let originalHeightBottom: number;
  
  let contentPaneClientStartX: number;
  let contentPaneClientStartY: number;

  let animationCancellationToken: number;

  const DIALOG_BOX_MAX_PERMITTED_HEIGHT: number = 0.75;
  
  let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
  let monaco: typeof Monaco | null = null;
  let editorContainer: HTMLElement;
  
  let main_div: HTMLElement;
  let data_div: HTMLElement;
  let code_div: HTMLElement;
  let terminal_div: HTMLElement;
  let monaco_div: HTMLElement;
  let resize_bar_vertical_div: HTMLElement;
  let resize_bar_horizontal_div: HTMLElement;
  let vertical_resize_bar_accent: HTMLElement;
  let vertical_resize_bar: HTMLElement;
  let duckHolderWrapper: HTMLElement;
  let horizontal_resize_bar_accent: HTMLElement;
  
  const bodyClientRect: DOMRect = $derived(document.body.getBoundingClientRect());

  
  let horizontalResizeBar: HTMLElement;

  const horizontalResizeBarComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!horizontalResizeBar) return undefined;
    return getComputedStyle(horizontalResizeBar);
  });



  let dialogBox: HTMLElement;

  const dialogBoxComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!dialogBox) return undefined;
    return getComputedStyle(dialogBox);
  });



  let textHolder: HTMLElement;

  const textHolderComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!textHolder) return undefined;
    return getComputedStyle(textHolder);
  });

  

  let duckHolder: HTMLElement;

  const duckHolderWrapperBoundingBox: DOMRect | undefined = $derived.by(() => {
    if (!duckHolder) return undefined;
    return duckHolder.getBoundingClientRect();
  });

  const duckHolderComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!duckHolder) return undefined;
    return getComputedStyle(duckHolder);
  })


  let hintTextContents: HTMLElement;
  
  const hintTextContentsComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!hintTextContents) return undefined;
    return getComputedStyle(hintTextContents);
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
    originalWidthLeft  = parseComputedDimensions(getComputedStyle(data_div).width);
    originalWidthRight = parseComputedDimensions(getComputedStyle(code_div).width);
    originalHeightTop = parseComputedDimensions(getComputedStyle(monaco_div).height);
    originalHeightBottom = parseComputedDimensions(getComputedStyle(terminal_div).height);

    const autoGeneratedSuperMain: HTMLElement | null = main_div.parentElement;
    if (!autoGeneratedSuperMain) return;
    const boundingRec: DOMRect = autoGeneratedSuperMain.getBoundingClientRect();

    contentPaneClientStartX = boundingRec.x + parseComputedDimensions(getComputedStyle(autoGeneratedSuperMain).marginLeft) + parseComputedDimensions(getComputedStyle(autoGeneratedSuperMain).paddingLeft) + parseComputedDimensions(getComputedStyle(main_div).paddingLeft) + parseComputedDimensions(getComputedStyle(main_div).marginLeft);
    contentPaneClientStartY = boundingRec.y + parseComputedDimensions(getComputedStyle(autoGeneratedSuperMain).marginTop) + parseComputedDimensions(getComputedStyle(autoGeneratedSuperMain).paddingTop) + parseComputedDimensions(getComputedStyle(main_div).marginTop) + parseComputedDimensions(getComputedStyle(main_div).paddingTop);
  }

  const setupDynamicElementSizing = () : void => {
    const actualScrollBarVertical: HTMLElement = resize_bar_vertical_div.childNodes[0] as HTMLElement;
    const actualScrollBarHorizontal: HTMLElement = resize_bar_horizontal_div.childNodes[0] as HTMLElement;

    actualScrollBarVertical.style.width = getComputedStyle(resize_bar_vertical_div).width;
    actualScrollBarHorizontal.style.height = getComputedStyle(resize_bar_horizontal_div).height;

    actualScrollBarVertical.style.left = "50%";
    actualScrollBarHorizontal.style.left = "50%";
    actualScrollBarVertical.style.transform = `translate(-50%)`;
    actualScrollBarHorizontal.style.transform = `translate(-50%)`;
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
    data_div.style.width = `${originalWidthLeft - dx}px`;
    code_div.style.width = `${originalWidthRight + dx}px`;   
  }

  const handleMouseDraggedVertical = (e: MouseEvent) => {
    if (!isDraggingVertical) return;
    const dy = originalHeightTop + contentPaneClientStartY - e.clientY;
    monaco_div.style.height = `${originalHeightTop - dy}px`;
    terminal_div.style.height = `${originalHeightBottom + dy}px`;
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
    const resize_bar_width = parseComputedDimensions(getComputedStyle(vertical_resize_bar).width);
    if (!isVerticalResized){
      vertical_resize_bar.style.width = `${resize_bar_width * 3}px`
      isVerticalResized = true;
      vertical_resize_bar_accent.style.visibility = "visible";

      if(theme === "dark"){
        vertical_resize_bar.style.background = "rgba(255,255,255,0.35)";
      }else{
        vertical_resize_bar.style.background = "#FF0000";
      }
    }else {
      isVerticalResized = false;
      vertical_resize_bar.style.background = "var(--color-bg)";
      vertical_resize_bar.style.width = `${resize_bar_width / 3}px`
      vertical_resize_bar_accent.style.visibility = "hidden";

    }
    vertical_resize_bar.style.left = "50%";
    vertical_resize_bar.style.transform = `translate(-50%)`;  
  }

  const toggleHorizontalWindowResizeBarResized = () => {
    if (isDraggingVertical) return;
    const resize_bar_height = parseOptionalDimensions(horizontalResizeBarComputedStyle?.height);
    if (!isHorizontalResized){
      isHorizontalResized = true;
      horizontalResizeBar.style.height = `${resize_bar_height * 3}px`
      horizontal_resize_bar_accent.style.visibility = "visible";
      if(theme === "dark"){
        horizontalResizeBar.style.background = "rgba(255,255,255,0.35)";
      }else{
        horizontalResizeBar.style.background = "#FF0000";
      }
    }else{
      isHorizontalResized = false;
      horizontalResizeBar.style.height = `${resize_bar_height / 3}px`;
      horizontalResizeBar.style.background = "var(--color-bg)";
      horizontal_resize_bar_accent.style.visibility = "hidden";
    }
    horizontalResizeBar.style.top = "50%";
    horizontalResizeBar.style.transform = `translate(-50%)`; 
  }

  const toggleDuckContainer = ()=>{
    if (isDuckContainerShown){
      hideDuckContainer();
    }else{
      showDuckContainer();
    }
  }

  const showDuckContainer = () => {
    duckHolderWrapper.style.right = "40px";

    isDuckContainerShown = true;
  }

  const hideDuckContainer = () => {
    duckHolderWrapper.style.right = `-${getOptionalDimesionsString(duckHolderComputedStyle?.width)}`;

    isDuckContainerShown = false;
    hideHintBox();
  }

  const expandVerticalBarWrapper = ()=>{
    if (isHorizontalResized){
      handleReleaseVertical();
      toggleHorizontalWindowResizeBarResized();      
    }
    toggleVerticalWindowResizeBarResized();
  }

  const hideVerticalBarWrapper = () => {
    if(!isDraggingHorizontal && wasClicked){
      wasClicked = false;
      if (isVerticalResized){
        toggleVerticalWindowResizeBarResized();      
      }
    }else{
        toggleVerticalWindowResizeBarResized();
    }
  }

  const expandHorizontalBarWrapper = ()=>{
    if (!isDraggingHorizontal){
      toggleHorizontalWindowResizeBarResized();
    }
  }

  const hideHorizontalBarWrapper = ()=>{
    if(!isDraggingVertical && wasClicked){
      wasClicked = false;
      if(isHorizontalResized){
        toggleHorizontalWindowResizeBarResized();
      }
    }else{
      toggleHorizontalWindowResizeBarResized();
    }
  }


  let frameCounter: number = 0;
  let currLetter: number = 0;
  let wrappingIndexCounter: number = 0;
  const myLorem: string = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni, cumque velit delectus perspiciatis minus voluptate pariatur nobis reiciendis voluptates suscipit cupiditate! Aut tenetur, rem veritatis consequuntur ea et qui suscipit.";
  const lettersPerSecond: number = 10;
  let wrappingIndices: number[];
  
  const toggleHintBox = () => {
    const textHolderWidth: number = parseOptionalDimensions(textHolderComputedStyle?.width) - parseOptionalDimensions(textHolderComputedStyle?.paddingLeft) - parseOptionalDimensions(textHolderComputedStyle?.paddingRight);
    const font = `${getOptionalDimesionsString(hintTextContentsComputedStyle?.fontSize)} ${getOptionalDimesionsString(hintTextContentsComputedStyle?.fontFamily)}`;
    
    if (isHintBoxShown){
      hideHintBox();
    }else{
      showHintBox();
    }
  
    wrappingIndices = findWrappingIndices(myLorem, font, textHolderWidth);
  
    requestAnimationFrame(printHintContents);
  }
  
  const hideHintBox = () => {
    textHolder.style.visibility = "hidden";
    moveHintBox(-(constGetOptionalDimensionsNumber(duckHolderWrapperBoundingBox?.left)));
  
    isHintBoxShown = false;
  }
  
  const showHintBox = () => {
    textHolder.style.visibility = "visible";
    moveHintBox(constGetOptionalDimensionsNumber(duckHolderWrapperBoundingBox?.left));
  
    isHintBoxShown = true;
  }
  
  const moveHintBox = (moveBy: number) => {
    dialogBox.style.right = `${bodyClientRect.right - moveBy}px`
  }
  
  const printHintContents = (currentTime : number) => {
  
    if (currLetter === myLorem.length){
      cancelAnimationFrame(animationCancellationToken);
      frameCounter = 0;
      wrappingIndexCounter = 0;
      currLetter = 0;
      return;
    }
    
    frameCounter++;
    if (frameCounter % ~~(60 / lettersPerSecond) == 0){
      if (wrappingIndices[wrappingIndexCounter] === currLetter){
        hintTextContents.innerHTML = `${hintTextContents.innerHTML}<br>`;
        // TODO make this not hardcoded somehow
        const newHeight = parseOptionalDimensions(textHolderComputedStyle?.height) + 24;
        const permittedHeight = parseOptionalDimensions(dialogBoxComputedStyle?.height) * DIALOG_BOX_MAX_PERMITTED_HEIGHT;
      
        if (newHeight <= permittedHeight){
          textHolder.style.height = `${newHeight}px`; 
        }
        wrappingIndexCounter++;
      }
      hintTextContents.textContent = `${hintTextContents.textContent}${myLorem.at(currLetter)}`;
      currLetter++;
    }
  
    animationCancellationToken = requestAnimationFrame(printHintContents);
  }

</script>

<main bind:this={main_div} class="flex h-[79vh] w-full my-5 bg-[var(--color-bg)]">

  {@render DuckHelper()}

  {@render ExerciseInformation()}

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    bind:this={resize_bar_vertical_div}
    class="w-1 h-full relative overflow-visible" 
    class:hover:cursor-col-resize={!isDraggingHorizontal}
    onmouseenter={!isDraggingHorizontal ? expandVerticalBarWrapper : undefined}
    onmouseleave={!isDraggingVertical ? hideVerticalBarWrapper : undefined}
    onmousedown={handleDownHorizontal}
    onmouseup={handleReleaseHorizontal}
  >
  <div 
    bind:this={vertical_resize_bar}
    class="h-full absolute flex flex-col justify-center items-center rounded-full"
  >
    <div bind:this={vertical_resize_bar_accent} class="w-1 h-25 bg-[var(--color-accent-1)] rounded-full none invisible"></div>
  </div>
</div>
  {@render CodeEditor()}
</main>


<!-- made into snippet as prep for moving to separate file in /Components -->
{#snippet DuckHelper()}
  <div bind:this={dialogBox} class="h-100 flex justify-end items-end invisible px-2 py-8 w-100 z-40 fixed right-10">
    <div bind:this={textHolder} class="w-[80%] h-[20%] p-2 text-black bg-white rounded-2xl overflow-scroll">
      <p bind:this={hintTextContents} class="overflow-hidden"></p>
    </div>
  </div>

  <div bind:this={duckHolderWrapper} class="h-110 w-110 z-50 flex justify-start transition-all duration-500 ease-out fixed right-[-25rem]" style="transition: all 0.5s cubic-bezier(0, 0, 0.2, 1);">
    <div class="h-full w-10">
      <div class="h-5 w-10 bg-transparent"></div>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="h-10 w-10 bg-[var(--color-tile)] flex justify-center items-center rounded-l-xs hover:cursor-pointer hover:bg-[#494969] outline-2 outline-[var(--color-primary)]" onclick={toggleDuckContainer}>
        <svg class="h-7.5 w-7.5 fill-white" viewBox="0 0 512 512">
          <g>
          	<path class="st0" d="M442.973,250.491c-25.635,18.05-196.165,53.474-141.134-74.936c3.975-11.693,6.732-29.452,6.732-42.457
          		c0-64.839-53.389-117.403-119.24-117.403c-50.361,0-93.398,30.764-110.867,74.224c-34.196,6.826-42.062-6.929-48.861-22.794
          		C22.261,50.005,3.509,54.898,0.255,76.915c-2.288,15.462,10.727,57.347,44.004,70.52c-9.423,4.482-17.365,10.671-24.444,18.754
          		c-9.507,10.877,2.654,29.198,16.147,24.566c12.733-4.37,32.433-6.001,45.419-6.358c5.814,13.109,13.09,24.398,19.972,33.568
          		c7.351,9.799-3.319,16.916-25.936,53.812c-30.979,50.549-35.874,117.403,2.992,165.822
          		c46.497,57.937,139.418,58.706,242.137,58.706c141.998,0,178.706-146.076,188.466-205.456
          		C521.529,214.702,493.813,214.702,442.973,250.491z M153.119,131.945c-10.802,0-19.559-8.758-19.559-19.569
          		c0-10.802,8.758-19.569,19.559-19.569c10.811,0,19.569,8.767,19.569,19.569C172.688,123.187,163.93,131.945,153.119,131.945z"/>
          </g>
        </svg>
      </div>
      <div class="h-95 w-10 bg-transparent"></div>
    </div>
    <div bind:this={duckHolder} class="h-110 w-100 flex flex-col justify-start items-center rounded-sm">
      <div class="w-full h-[90%] p-2 bg-blue-500 rounded-md">
        <img src="/sample-duck.png" alt="duck"/>
      </div>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="w-full h-[10%] flex justify-center items-center bg-transparent">
        <div class="w-[80%] h-[80%] flex justify-center items-center bg-[var(--color-tile)] rounded-xs outline-2 outline-[var(--color-primary)] hover:cursor-pointer hover:bg-[#494969]" 
        onclick={toggleHintBox}
        >
          <p class="select-none">Jarvis talk to me</p>
        </div>
      </div>
    </div>
  </div>
{/snippet}



{#snippet ExerciseInformation()}
  <div bind:this={data_div} class="flex flex-col text-center w-[30%] h-full overflow-hidden">
    <div class="flex justify-center text-l items-center w-full h-[20%]">
      <span class="m-2">
        {data.name}
      </span>
    </div>
    <div class="w-full h-[80%] bg-[var(--color-tile)] rounded-md text-xs overflow-scroll">
      <p class="mx-2 my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut voluptatem delectus quod nesciunt modi vel adipisci eveniet, iste, molestias odio architecto explicabo incidunt facere quibusdam, beatae fuga corrupti sint possimus!
      </p>
      <hr>
      <p class="mx-2 my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut voluptatem delectus quod nesciunt modi vel adipisci eveniet, iste, molestias odio architecto explicabo incidunt facere quibusdam, beatae fuga corrupti sint possimus!
      </p>
      <hr>
      <p class="mx-2 my-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut voluptatem delectus quod nesciunt modi vel adipisci eveniet, iste, molestias odio architecto explicabo incidunt facere quibusdam, beatae fuga corrupti sint possimus!
      </p> 
    </div>
  </div>  
{/snippet}

{#snippet CodeEditor()}
  <div bind:this={code_div} class="w-full h-full flex flex-col px-1">
      <div bind:this={monaco_div} class="w-full h-[85%] rounded-t-md overflow-hidden" bind:this={editorContainer}></div>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          id="resize-bar-holder-horizontal" 
          bind:this={resize_bar_horizontal_div}
          class="h-1 w-full relative overflow-visible"
          class:hover:cursor-row-resize={!isDraggingVertical}
          onmouseenter={!isDraggingVertical ? expandHorizontalBarWrapper : undefined}
          onmouseleave={!isDraggingHorizontal ? hideHorizontalBarWrapper : undefined}
          onmousedown={handleDownVertical}
          onmouseup={handleReleaseVertical}
        >
          <div bind:this={horizontalResizeBar} class="w-full absolute flex justify-center items-center rounded-full">
            <div bind:this={horizontal_resize_bar_accent} class="w-25 h-1 bg-[var(--color-accent-1)] rounded-full none invisible"></div>
          </div>
        </div>
      <div bind:this={terminal_div} class="w-full h-[15%] bg-[var(--color-tile)] px-3 py-1 rounded-b-md ">
        <span class="font-mono">&#123;username&#125;@&#123;exercise_name&#125;:/home/&#123;username&#125;/terminal$ </span>
      </div>
  </div>
{/snippet}