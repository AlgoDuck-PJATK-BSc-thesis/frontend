<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { DuckDto, DuckShopPage } from './Dtos';
	import { simulateFetchAsync } from './loadDucks';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

  let { data } : {data: PageData} = $props();

  let selectedDuckImage: HTMLElement;

  let duckShopPage: DuckShopPage = $state(data as DuckShopPage);
  let duckNextPage: DuckShopPage | null = $state(null);
  
  let currDucks: Array<DuckDto> = $derived(duckShopPage.ducksPaged);
  let nextDucks: Array<DuckDto> | null = $derived.by(()=>{
    return duckNextPage ? duckNextPage.ducksPaged : null;
  });
  
  let currentPreviewedDuck: DuckDto | undefined = $derived(currDucks.at(0))

  let isAnimating: boolean = $state(false);
  let rowType: 'flex-col' | 'flex-col-reverse' = $state("flex-col");
  let currentPage = $state(0);

  let shift: number = $derived.by(()=>{
    return rowType === "flex-col" ? -100 : 100;
  });

  const divs: Array<HTMLElement> = [];
    
  const hoverAnimationTime: number = 3000;
  let raf: number | null;
  let animationStartTime: number | null = null;
  const driftAmount = 15;

  const waitForTransition = (element: HTMLElement): Promise<void> => {
    return new Promise((resolve) => {
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.target === element && e.propertyName === 'transform') {
          element.removeEventListener('transitionend', handleTransitionEnd);
          resolve();
        }
      };
      element.addEventListener('transitionend', handleTransitionEnd);
    });
  };

  const getNextPage = async (): Promise<void> => {
    if (!duckShopPage.hasNext || isAnimating) return;
    
    currentPage++;
    duckNextPage = simulateFetchAsync(currentPage);
    
    await scrollPage();
  };

  const getPrevPage = async (): Promise<void> => {
    if (!duckShopPage.hasPrev || isAnimating) return;
    
    currentPage--;
    duckNextPage = simulateFetchAsync(currentPage);
    rowType = "flex-col-reverse";
    
    await scrollPage();
  };

  const scrollPage = async (): Promise<void> => {
    isAnimating = true;
        
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const runningTransitions: Promise<void>[] = [];
    
    divs.forEach(div => {
      if (div) {
        div.style.transform = `translateY(${shift}%)`;
        runningTransitions.push(waitForTransition(div));
      }
    });
    
    await Promise.all(runningTransitions);
    
    duckShopPage = duckNextPage!;
    
    divs.forEach(div => {
      if (div) {
        div.style.transition = 'none';
        div.style.transform = 'translateY(0)';
      }
    });
        
    await new Promise(resolve => setTimeout(resolve, 20));
    
    divs.forEach(div => {
      if (div) {
        div.style.transition = '';
      }
    });
    
    duckNextPage = null;
    divs.length = 1; 
    isAnimating = false;
    
    rowType = "flex-col";
  }

  const animateDuckHover = (currentTime: number) : void => {
    if (!animationStartTime) {
      animationStartTime = currentTime;
    }
    
    const elapsed = currentTime - animationStartTime;
    const progress = (elapsed % hoverAnimationTime) / hoverAnimationTime;
    
    selectedDuckImage.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * driftAmount}px)`;
    
    raf = requestAnimationFrame(animateDuckHover);
  }

  onMount(()=>{
    raf = requestAnimationFrame(animateDuckHover);
    
    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  });

</script>

<main class="w-full h-[90vh] flex justify-start">
  <div class="relative left-0 w-[75%] h-full bg-green-500">


    <div class="absolute w-[25%] h-[8%] bg-amber-50 left-[3%] top-0 flex justify-center">
      <button class="w-[50%] h-full border-4 border-t-0 border-r-2 border-black"> huh</button>
      <button class="w-[50%] h-full border-4 border-t-0 border-l-2 border-black"> huh</button>
    </div>

    <div class="absolute w-[90%] h-[60%] top-[9%] left-[5%] flex {rowType} justify-start overflow-hidden">

      {@render ShopPage("bg-blue-500", currDucks)}
      {#if nextDucks}      
        {@render ShopPage("bg-blue-500", nextDucks)}
      {/if}
      
    </div> 
    
    <div class="absolute w-[65%] h-[35%] bg-amber-50 bottom-0 left-[3%]"></div>
  </div>

  <div class="relative right-0 w-[25%] px-3 h-full bg-red-500 flex flex-col-reverse">
    <div class="absolute top-0 w-[75%] h-[24%] bg-red-400">

    </div>
    <div class="bg-blue-950 h-[75%] flex flex-col justify-centstart items-center">
      <div bind:this={selectedDuckImage} class="w-full aspect-square m-[5%]">
        <CloudfrontImage path={`Ducks/Outfits/duck-${currentPreviewedDuck!.id}.png`} cls="w-full aspect-square" alt="{currentPreviewedDuck!.id}"/>
      </div>
      <div class="w-full h-[10%] bg-red-500"></div>
      <div class="w-full h-[10%] bg-transparent flex justify-center items-center text-center">
        <button class="bg-blue-500 w-[60%] h-[98%]" onclick="{()=>{window.alert("purchased")}}">
          buy
        </button>
      </div>
    </div>
  </div>


</main>



{#snippet ShopPage(color: string, ducksToBeRendered: Array<DuckDto>)}
  <div bind:this={divs[divs.length]} class="bg-amber-50 w-full h-full min-h-full relative grid grid-cols-4 grid-rows-3 gap-x-5 gap-y-3 p-3 transition-transform duration-1000 ease-out">
    <div class="absolute w-10 h-20 left-5 top-5 flex-col">
      <button class="w-full h-[50%] m-1 bg-gray-400 opacity-150 disabled:opacity-50 hover:cursor-pointer" disabled={isAnimating || !duckShopPage.hasPrev} onclick="{getPrevPage}">t</button>
      <button class="w-full h-[50%] m-1 bg-gray-400 opacity-150 disabled:opacity-50 hover:cursor-pointer" disabled={isAnimating || !duckShopPage.hasNext} onclick="{getNextPage}">b</button>
    </div>
    {#each ducksToBeRendered as duck, i}
      <button class="w-full h-full flex justify-center items-center hover:cursor-pointer {color}" onclick="{()=>{currentPreviewedDuck=duck}}">
        <CloudfrontImage path={`Ducks/Outfits/duck-${duck.id}.png`} cls="h-full aspect-square" alt={duck.id}/>
      </button>
    {/each}
  </div>
{/snippet}