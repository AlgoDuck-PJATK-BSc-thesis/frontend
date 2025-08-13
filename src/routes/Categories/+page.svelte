<script lang="ts">
  import { goto } from '$app/navigation';
  
  import Island from '$lib/images/Categories/Wysepka2.png'
	import { onMount } from 'svelte';
	import type { CategoriesPageLoad } from '../../Types/Categories/CategoriesPageLoad';

  let { data } : { data: CategoriesPageLoad } = $props();

  let scrollableFrame : HTMLElement;
  
  const scrollableFrameComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!scrollableFrame) return undefined;
    return getComputedStyle(scrollableFrame);
  });
  
  let main : HTMLElement;
  
  const mainComputedStyle: CSSStyleDeclaration | undefined = $derived.by(() => {
    if (!main) return undefined;
    return getComputedStyle(main);
  });

  const scrollableFrameSpaceXInPercentPerIsland: number = 30;
  
  let categoryDivs: Array<HTMLElement> = $state([]);
  
  let lastXCoords : number;
  let currXCoords : number;

  let lastD1X : number;
  let lastTime : number = 0;

  let windowWidth = $state(0);
  let windowHeight = $state(0);

  let cancellationToken : number | null = null;
  let isDragging : boolean = $state(false); 

  let clicked: boolean = $state(false);

  const updateBasedOnMouse = (x : number) => {
    const dx : number = x - lastXCoords;

    const newLeft : number = parseOptionalDimensions(scrollableFrameComputedStyle?.left) + dx
    const maxLeft : number = parseOptionalDimensions(scrollableFrameComputedStyle?.width) - parseOptionalDimensions(mainComputedStyle?.width);
    if (newLeft < 0 && Math.abs(newLeft) < maxLeft){
      scrollableFrame.style.left = `${newLeft}px`
    }

  }
  
  const animateDragged = (currentTime : number) => {
    if (!isDragging) {
      cancellationToken = null;
      return; 
    }
    
    const deltaTime = (currentTime - lastTime) / 1000;
    
    if (deltaTime > 0 && lastTime !== 0) { 
      const d1x = (currXCoords - lastXCoords) / deltaTime;
      
      updateBasedOnMouse(currXCoords);
      
      lastXCoords = currXCoords;
      lastD1X = d1x;
    }
    
    lastTime = currentTime; 
    cancellationToken = requestAnimationFrame(animateDragged); 
  }
  
  const handleDragged = (e: MouseEvent) => {
    isDragging = true;
    clicked = false;
    currXCoords = e.x;
  }
  
  
  const bleedSpeed = () => {
    if (Math.abs(lastD1X) < 10) {
      cancellationToken = null;
      return;
    }
    const dtxDampened = lastD1X / 100;

    const left = parseOptionalDimensions(scrollableFrameComputedStyle?.left);
    const newLeft = left + dtxDampened;
    const maxLeft = parseOptionalDimensions(scrollableFrameComputedStyle?.width) - parseOptionalDimensions(mainComputedStyle?.width);
    
    if (newLeft <= 0 && Math.abs(newLeft) <= maxLeft) {
      scrollableFrame.style.left = `${newLeft}px`;
    } else {
      cancellationToken = null;
      return;
    }

    lastD1X *= 0.95;
     
    cancellationToken = requestAnimationFrame(bleedSpeed);
  }

  const handleMouseUp = () => {
    document.body.style.userSelect = "auto";

    isDragging = false;
    
    if (cancellationToken) {
      cancelAnimationFrame(cancellationToken);
      cancellationToken = null;
    }
    
    if (Math.abs(lastD1X) > 50) {
      cancellationToken = requestAnimationFrame(bleedSpeed);
    }
    
    document.removeEventListener('mousemove', handleDragged);
    document.removeEventListener('mouseup', handleMouseUp);
  }
  
  const handleMouseDown = (e : MouseEvent) => {
    document.body.style.userSelect = "none"; 
    if (cancellationToken) {
      cancelAnimationFrame(cancellationToken);
      cancellationToken = null;
    }

    isDragging = true; 
    lastXCoords = e.x;
    currXCoords = e.x;
    lastD1X = 0;
    lastTime = 0;
    
    document.addEventListener('mousemove', handleDragged);
    document.addEventListener('mouseup', handleMouseUp);
    
    cancellationToken = requestAnimationFrame(animateDragged);
  }

  export const parseComputedDimensions = (computedDimension: string) : number => {
      return parseInt(computedDimension.replaceAll('px', ''))
  }

  export const getOptionalDimesionsString = (dim: string | undefined) : string => {
      return dim ?? "0px";
  }

  export const constGetOptionalDimensionsNumber = (dim: number | undefined) : number => {
      return dim ?? 0;
  }

  export const parseOptionalDimensions = (dim: string | undefined) : number => {
      return parseComputedDimensions(getOptionalDimesionsString(dim));
  }

  const selectCategory = (id: string) : void => {
    goto(`/Categories/some-${id}/Problems`);
  }


  const calculateIslandCoordinates = () : void => {
    const clientRect: DOMRect = main.getBoundingClientRect();
    const mainWidth: number = clientRect.width;
    const mainHeight: number = clientRect.height;

    const category1: HTMLElement | undefined = categoryDivs.at(0);
    if (!category1) return;
    
    const baselineIslandComputedStyle: CSSStyleDeclaration = getComputedStyle(category1);

    const islandWidthParsed: number = parseComputedDimensions(baselineIslandComputedStyle.width);
    const islandHeightParsed: number = parseComputedDimensions(baselineIslandComputedStyle.height);

    const paddingX: number = islandWidthParsed / 4;
    const paddingY: number = islandHeightParsed / 4

    const scrollableFrameWidthInPixels: number = Math.max(paddingX + islandWidthParsed * 1.25 * categoryDivs.length, mainWidth);

    const minY: number = paddingY;
    const maxY: number = mainHeight - paddingY;
    const legalRangeHeight: number = maxY - minY;
    const halfRange: number = legalRangeHeight / 2;
    
    scrollableFrame.style.width = `${scrollableFrameWidthInPixels}px`;
    
    for (let i = 0; i < categoryDivs.length; ++i){
      const islandX: number = paddingX + islandWidthParsed * 1.25 * i;
      const waveInput: number = (i / categoryDivs.length) * Math.PI * 4;
      const islandY: number = minY + (Math.sin(waveInput) + 1) * halfRange;
      
      categoryDivs[i].style.transform = `translateX(${islandX}px) translateY(${islandY - islandHeightParsed / 2}px)`;
    }
  }


  
  onMount(() => { 
    calculateIslandCoordinates();
  });
</script>

<svelte:window on:resize={calculateIslandCoordinates} bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />


<main bind:this={main} class="w-full h-[calc(100vh-10rem)] relative rounded-2xl overflow-hidden">
  <div bind:this={scrollableFrame}  role="button" tabindex="0" class="w-[300%] hover:cursor-grab active:cursor-grabbing h-full absolute z-10 bg-blue-900 bg-repeat-x bg-no-repeat-y bg-[length:auto_100%]"
    onmousedown={handleMouseDown}
    onmouseup={handleMouseUp}
  >

  <!-- TODO this hypothetically presents an interesting opportunity to use tastacks infinite query. More so for presentation reasons rather than an actual practical application but still may be fun -->
    <div class="relative w-full h-full">
      {#each data.LoadedCategories as loadedCategory, i}
        <button bind:this={categoryDivs[i]} class="w-100 h-100 absolute rounded-full flex hover:cursor-pointer z50 justify-center items-center bg-transparent select-none" 
        onmousedown="{() => {clicked = true}}"
        onmouseup="{() => {if (clicked) selectCategory(loadedCategory.id)}}">
          <img class="w-full" src="{Island}" alt="category thematic island" draggable="false"/>
        </button>
      {/each}
    </div>
  </div>
</main>