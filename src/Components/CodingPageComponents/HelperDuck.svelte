<script lang="ts">
  import { findWrappingIndices, getOptionalDimesionsString, constGetOptionalDimensionsNumber, parseOptionalDimensions, ColorHandler } from "../../Utils/index";


  const DIALOG_BOX_MAX_PERMITTED_HEIGHT: number = 0.75;


  const bodyClientRect: DOMRect = $derived(document.body.getBoundingClientRect());


  let isDuckContainerShown: boolean = false;
  let isHintBoxShown: boolean = false;

  let animationCancellationToken: number;

  let duckHolderWrapper: HTMLElement;
  let duckToggleButton: HTMLElement;

  let dialogBox: HTMLElement;

  let isHovered: boolean = false;
  let baseColor: string = "oklch(0.5 0.1 0.5)";

  const dialogBoxComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!dialogBox) return undefined;
    return getComputedStyle(dialogBox);
  });


  let textHolder: HTMLElement;

  const textHolderComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!textHolder) return undefined;
    return getComputedStyle(textHolder);
  });


  let hintTextContents: HTMLElement;
  
  const hintTextContentsComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!hintTextContents) return undefined;
    return getComputedStyle(hintTextContents);
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




    let frameCounter: number = 0;
    let currLetter: number = 0;
    let wrappingIndexCounter: number = 0;
    const myLorem: string = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni, cumque velit delectus perspiciatis minus voluptate pariatur nobis reiciendis voluptates suscipit cupiditate! Aut tenetur, rem veritatis consequuntur ea et qui suscipit.";
    const lettersPerSecond: number = 10;
    let wrappingIndices: number[];

    const toggleDuckContainer = (): void =>{
    if (isDuckContainerShown){
      hideDuckContainer();
    }else{
      showDuckContainer();
    }
  }

  const showDuckContainer = (): void => {
    duckHolderWrapper.style.right = "40px";

    isDuckContainerShown = true;
  }

  const hideDuckContainer = (): void => {
    duckHolderWrapper.style.right = `-${getOptionalDimesionsString(duckHolderComputedStyle?.width)}`;

    isDuckContainerShown = false;
    hideHintBox();
  }


  const hideHintBox = (): void => {
    textHolder.style.visibility = "hidden";
    moveHintBox(-(constGetOptionalDimensionsNumber(duckHolderWrapperBoundingBox?.left)));
  
    isHintBoxShown = false;
  }
  
  const showHintBox = (): void => {
    textHolder.style.visibility = "visible";
    moveHintBox(constGetOptionalDimensionsNumber(duckHolderWrapperBoundingBox?.left));
  
    isHintBoxShown = true;
  }
  
  const moveHintBox = (moveBy: number): void => {
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

  const toggleHintBox = (): void => {
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

  const toggleColor = (): void=> {
    if (!isHovered){
      baseColor = getComputedStyle(duckToggleButton).backgroundColor;
      duckToggleButton.style.background = new ColorHandler(baseColor).getHovered();
      isHovered = true;
    }else{
      isHovered = false;
      duckToggleButton.style.background = baseColor;
    }
  }


</script>


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
      <!-- svelte-ignore a11y_mouse_events_have_key_events -->
      <div bind:this={duckToggleButton} class="h-10 w-10 bg-[var(--color-tile)] flex justify-center items-center rounded-l-xs hover:cursor-pointer outline-2 outline-[var(--color-primary)]" onclick={toggleDuckContainer} onmouseover={toggleColor} onmouseout={toggleColor}>
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