<script lang="ts">
	import type { ItemType } from "$lib/Components/Misc/Pond/duckTypes";
	import { createQuery, useQueryClient } from "@tanstack/svelte-query";
	import type { Item } from "./Dtos";
	import { onMount, type Component } from "svelte";
	import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
    import ArrowUp from "$lib/images/store/arrow-up.png";
    import ArrowUpDown from "$lib/images/store/arrow-up-down.png";
    import ArrowDown from "$lib/images/store/arrow-down.png";
    import ArrowDownDown from "$lib/images/store/arrow-down-down.png";

	let {
		options,
        currentPage = $bindable(),
        currentPageSize = $bindable()
	}: {
		options: {
            itemType: ItemType,
            endpoint: string,
            itemDisplay: Component<{ options: Item, onclick: (() => void) }>,
            select: (selected: Item, wasAutomatic: boolean) => void
		},
        currentPage: number, currentPageSize: number
	} = $props();
    
    const queryClient = useQueryClient();
    
    onMount(() => {
        currentPage = 1;
    })
    let isTransitioning: boolean = $state(false);

    let itemQuery = $derived(
		createQuery({
			queryKey: [ options.itemType, currentPage, currentPageSize],
			queryFn: async () => {
                return await FetchFromApi<CustomPageData<Item>>(
					options.endpoint, {
                        method: 'GET' 
                    }, fetch, new URLSearchParams({
						currentPage: currentPage.toString(),
						pageSize: currentPageSize.toString()
					})
				);
			}
		})
	);

    let hasNext: boolean = $derived($itemQuery.data?.body.nextCursor !== null);
    let hasPrev: boolean = $derived($itemQuery.data?.body.prevCursor !== null);
	let totalPages = $derived(Math.ceil(($itemQuery.data?.body.totalItems ?? 0) / currentPageSize));
    
    $effect(() => {
		if (hasNext) {
			queryClient.prefetchQuery({
				queryKey: [options.itemType, currentPage + 1, currentPageSize],
				queryFn: async () =>
					FetchFromApi<CustomPageData<Item>>(options.endpoint, {
                             method: 'GET' 
                        }, fetch, new URLSearchParams({
							currentPage: (currentPage + 1).toString(),
							pageSize: currentPageSize.toString()
						})
					)
			});
		}
		if (hasPrev) {
			queryClient.prefetchQuery({
				queryKey: [ options.itemType, currentPage - 1, currentPageSize],
				queryFn: async () =>
					FetchFromApi<CustomPageData<Item>>(options.endpoint, {
                            method: 'GET'
                        }, fetch, new URLSearchParams({
							currentPage: (currentPage - 1).toString(),
							pageSize: currentPageSize.toString()
						})
					)
			});
		}
	});

    type pageIndexMapping = {
        pageNum: number,
        items: Item[],
    }

    let allPages: pageIndexMapping[] = $state([]);

    $effect(() => {
        const _ = $itemQuery.data;
        
        allPages = Array.from({ length: totalPages }, (_, i) => ({
            pageNum: i + 1,
            items: (queryClient.getQueryData([options.itemType, i + 1, currentPageSize]) as StandardResponseDto<CustomPageData<Item>>)?.body?.items ?? []
        }));
    });
    
    let viewportHeight: number = $state(0);

    let isButtonDownPressed: boolean = $state(false);
    let isButtonUpPressed: boolean = $state(false);

    const globalMouseUpListener = () => {
        isButtonDownPressed = false;
        isButtonUpPressed = false;
        document.removeEventListener('mouseup', globalMouseUpListener);
    }

    let transform: number = $derived((currentPage - 1) * viewportHeight);

    let conveyorBelt: HTMLDivElement;

   const addTransitionAndScroll = (direction: 'up' | 'down') => {
        if (direction === 'up' && !hasPrev) return;
        if (direction === 'down' && !hasNext) return;

        isTransitioning = true;

        if (direction === 'up') {
            isButtonUpPressed = true;
            currentPage--;
        } else {
            isButtonDownPressed = true;
            currentPage++;
        }
        
        const cleanup = () => {
            isTransitioning = false;
            conveyorBelt.removeEventListener('transitionend', cleanup);
        };
        conveyorBelt.addEventListener('transitionend', cleanup);
        document.addEventListener('mouseup', globalMouseUpListener);

        const firstItem: Item | undefined = $itemQuery.data?.body?.items?.at(0);
        if (firstItem)  
            options.select(firstItem, true);
    }

    let wasDefaultSelected: boolean = $state(false);
    $effect(() => {
        if (wasDefaultSelected) return;
        const firstItem: Item | undefined = $itemQuery.data?.body?.items?.at(0);
        if (!firstItem) return;
        options.select(firstItem, true);
        wasDefaultSelected = true;
    })

</script>

<main class="h-full w-full flex flex-row-reverse">
    <div bind:clientHeight={viewportHeight} class="w-full relative h-full">
        <div bind:this={conveyorBelt} class="w-full absolute flex flex-col justify-start" class:scroll-transition={isTransitioning} style="height: {100 * totalPages}%; transform: translateY(-{transform}px);">            
            {#each allPages as { pageNum, items }, i}
                {@render singlePage(items)}      
            {/each}
        </div>
    </div>
    <div class="w-8 h-full items-center py-[2%]">
        <div class="w-full flex flex-col">
            <button 
                onmousedown={() => addTransitionAndScroll('up')}
                class="w-full">
                <img class="w-full hover:cursor-pointer select-none pointer-events-none" src={isButtonUpPressed ? ArrowUpDown : ArrowUp} alt="arrow up">
            </button>
            <button 
                onmousedown={() => addTransitionAndScroll('down')}
                class="w-full">
                <img class="w-full hover:cursor-pointer select-none pointer-events-none" src={isButtonDownPressed ? ArrowDownDown : ArrowDown} alt="arrow down">
            </button>
        </div>
    </div>
</main>

{#snippet singlePage(items: Item[])}
    {@const Comp = options.itemDisplay}
    <div class="w-full h-full relative">
        <img src="/shop/edited-photo.png"
			class="pointer-events-none absolute inset-0 h-full w-full select-none"
			alt=""
		/>
        <div class="w-full h-full absolute bg-transparent grid grid-cols-4 grid-rows-3 px-[2%] py-[2.8%] gap-x-[2%] gap-y-[4%]">
            {#each items as item}
                <Comp options={item} onclick={() => { 
                    options.select(item, false);
                }}/>
            {/each}
        </div>
    </div>
{/snippet}

<style>
    .scroll-transition {
        transition: transform 500ms ease-out;
    }
</style>
