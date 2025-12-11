<script lang="ts">
	import type { Duck, DuckShopPage } from './Dtos';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';

  let { data } : { data: StandardResponseDto<CustomPageData<Duck>> } = $props();
  
  let currentPage: number = $state(data.body.currPage);
  let pageSize: number = $state(data.body.pageSize);
  
  const queryClient = useQueryClient();

  let query = $derived(createQuery({
    queryKey: ['ducks', currentPage, pageSize],
    queryFn: async () => {
      return await FetchFromApi<CustomPageData<Duck>>("Item", {
        method: "GET"
      }, fetch, new URLSearchParams({ currentPage: currentPage.toString(), pageSize: pageSize.toString()}))
    },
    initialData: data,
  }));


  let duckShopPage: DuckShopPage = $derived({
      hasPrev: currentPage > 1,
      hasNext: Math.ceil($query.data.body.totalItems / $query.data.body.pageSize) > currentPage,
      totalPages: $query.data.body.totalItems / $query.data.body.pageSize,
      ducksPaged: $query.data.body.items
  } as DuckShopPage);

  $effect(() => {
    if (duckShopPage.hasNext) {
      queryClient.prefetchQuery({
        queryKey: ['ducks', currentPage + 1, pageSize],
        queryFn: async () => {
          return await FetchFromApi<CustomPageData<Duck>>("Item", {
            method: "GET"
          }, fetch, new URLSearchParams({ currentPage: (currentPage + 1).toString(), pageSize: pageSize.toString()}))
        }
      });
    }
    
    if (duckShopPage.hasPrev) {
      queryClient.prefetchQuery({
        queryKey: ['ducks', currentPage - 1, pageSize],
        queryFn: async () => {
          return await FetchFromApi<CustomPageData<Duck>>("Item", {
            method: "GET"
          }, fetch, new URLSearchParams({ currentPage: (currentPage - 1).toString(), pageSize: pageSize.toString()}))
        }
      });
    }
  });

  let duckNextPage: DuckShopPage | null = $state(null);
  
  let currDucks: Array<Duck> = $derived(duckShopPage.ducksPaged);
  let nextDucks: Array<Duck> | null = $derived.by(()=>{
    return duckNextPage ? duckNextPage.ducksPaged : null;
  });
  
  let currentPreviewedDuck: Duck | undefined = $derived(currDucks.at(0))

  let isAnimating: boolean = $state(false);
  let rowType: 'flex-col' | 'flex-col-reverse' = $state("flex-col");

  let shift: number = $derived.by(()=>{
    return rowType === "flex-col" ? -100 : 100;
  });

  const pageContainers: Array<HTMLElement> = [];
    
  const hoverAnimationTime: number = 3000;
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
    duckNextPage = {
        hasPrev: currentPage > 1,
        hasNext: Math.ceil($query.data.body.totalItems / $query.data.body.pageSize) > currentPage,
        totalPages: $query.data.body.totalItems / $query.data.body.pageSize,
        ducksPaged: $query.data.body.items
    } as DuckShopPage;
    
    await scrollPage();
  };

  const getPrevPage = async (): Promise<void> => {
    if (!duckShopPage.hasPrev || isAnimating) return;
    
    currentPage--;
    duckNextPage = {
        hasPrev: currentPage > 1,
        hasNext: Math.ceil($query.data.body.totalItems / $query.data.body.pageSize) > currentPage,
        totalPages: $query.data.body.totalItems / $query.data.body.pageSize,
        ducksPaged: $query.data.body.items
    } as DuckShopPage;
    rowType = "flex-col-reverse";
    
    await scrollPage();
  };

  const scrollPage = async (): Promise<void> => {
    isAnimating = true;
        
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const runningTransitions: Promise<void>[] = [];
    
    pageContainers.forEach(container => {
      if (container) {
        container.style.transform = `translateY(${shift}%)`;
        runningTransitions.push(waitForTransition(container));
      }
    });
    
    await Promise.all(runningTransitions);
    
    duckShopPage = duckNextPage!;
    
    pageContainers.forEach(container => {
      if (container) {
        container.style.transition = 'none';
        container.style.transform = 'translateY(0)';
      }
    });
        
    await new Promise(resolve => setTimeout(resolve, 20));
    
    pageContainers.forEach(container => {
      if (container) {
        container.style.transition = '';
      }
    });
    
    duckNextPage = null;
    pageContainers.length = 0; 
    isAnimating = false;
    
    rowType = "flex-col";
  }
</script>

<main class="w-full h-full relative">
  <div class="fixed w-10 h-20 left-5 top-5 flex flex-col z-999">             
    <button class="w-full h-[50%] m-1 bg-gray-400 opacity-150 disabled:opacity-50 hover:cursor-pointer" disabled={isAnimating || !duckShopPage.hasPrev} onclick="{getPrevPage}">↑</button>
    <button class="w-full h-[50%] m-1 bg-gray-400 opacity-150 disabled:opacity-50 hover:cursor-pointer" disabled={isAnimating || !duckShopPage.hasNext} onclick="{getNextPage}">↓</button>
  </div>
  <img class="absolute inset-0 pointer-events-none select-none top-0 w-full h-full object-cover" src="/shop/store-bg.gif" alt="shop background gif">
  <img class="absolute inset-0 pointer-events-none select-none top-0 w-full h-full z-500 object-cover" src="/shop/shopkeep.gif" alt="shopkeep">
    <div class="w-full h-full flex flex-row absolute top-0 z-150">
      <div class="w-3/4 h-full relative">
        <div class="absolute right-[1%] top-[4%] w-[91%] h-[65%]">
          <div class="w-full h-full relative overflow-hidden">
            <div class="w-full h-full flex {rowType} justify-start">
              {@render ShopPage(currDucks)}
              {#if nextDucks}      
                {@render ShopPage(nextDucks)}
              {/if}
            </div>
          </div>
        </div>
      </div>
    <div class="w-1/4 h-full relative flex flex-col items-center">
      {#if currentPreviewedDuck}
        <div class="w-[50%] aspect-square absolute top-[40%]" {@attach node => {
          let localAnimationStartTime: number | undefined;
          let localRaf: number;
          const animateDuckHover = (currentTime: number) => {
            if (!localAnimationStartTime) {
              localAnimationStartTime = currentTime;
            }
            const elapsed = currentTime - localAnimationStartTime;
            const progress = (elapsed % hoverAnimationTime) / hoverAnimationTime;
            node.style.transform = `translateY(${Math.sin(progress * Math.PI * 2) * driftAmount}px)`;
            localRaf = requestAnimationFrame(animateDuckHover);
          };
          localRaf = requestAnimationFrame(animateDuckHover);
          return () => {
            if (localRaf) {
              cancelAnimationFrame(localRaf);
            }
          }
          }}>
          <CloudfrontImage path={`Ducks/Outfits/duck-${currentPreviewedDuck.itemId}.png`} cls={""}/>
        </div>
      {/if}
    </div>
  </div>
</main>

{#snippet ShopPage(ducksToBeRendered: Array<Duck>)}
  <div bind:this={pageContainers[pageContainers.length]} class="w-full h-full relative flex-shrink-0 transition-transform duration-1000 ease-out">
    <img src="/shop/edited-photo.png" class="w-full h-full pointer-events-none select-none absolute inset-0" alt=""/>
    <div class="w-full h-full grid grid-cols-4 gap-x-[1.5%] gap-y-[4%] py-[2%] px-[1.5%] grid-rows-3 relative">
      {#each ducksToBeRendered as duck, i}
        <button class="w-full h-full flex justify-center items-center hover:cursor-pointer" onclick="{()=>{currentPreviewedDuck=duck}}">
          <CloudfrontImage path={`Ducks/Outfits/duck-${duck.itemId}.png`} cls="h-full aspect-square" alt={duck.itemId}/>
        </button>
      {/each}
    </div>
  </div>
{/snippet}