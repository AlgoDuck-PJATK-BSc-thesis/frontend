<script lang='ts'>
	import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
	import { createInfiniteQuery } from "@tanstack/svelte-query";
	import DeletionModal from "./DeletionModal.svelte";
	import type { ItemDto } from "./types";
	import { goto } from "$app/navigation";
	import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import SettingsIconSvg from "$lib/svg/SettingsIconSvg.svelte";
	import Spinner from "$lib/svg/spinner.svelte";
	import SpinnerIconSvg from "$lib/svg/EditorComponentIcons/SpinnerIconSvg.svelte";

    const itemQuery = createInfiniteQuery({
        queryKey: ["all items"],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
            return await FetchFromApi<CustomPageData<ItemDto>>("AllItemsPaged", {
                method: "GET"
            }, fetch, new URLSearchParams({ pageSize: "12", currentPage: pageParam.toString() }))
        },
        getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<ItemDto>>) => firstPage.body.prevCursor ?? undefined,
        getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<ItemDto>>) => lastPage.body.nextCursor ?? undefined,
        select: (data: any) => data.pages.map((p: StandardResponseDto<CustomPageData<ItemDto>>) => p.body.items).flat() as ItemDto[],
    });

    $inspect($itemQuery.data);

    let selectedItems: ItemDto[] = $state([]);
    let selectAll: boolean = $state(false);
    let isDeletionModalShown: boolean = $state(false);

    const toggleSelectAll = () => {
        if (selectAll) {
            selectedItems = [];
        } else {
            selectedItems = [...($itemQuery.data ?? [])];
        }
        selectAll = !selectAll;
    };

    const isSelected = (item: ItemDto) => selectedItems.some(i => i.id === item.id);

    const toggleItem = (item: ItemDto) => {
        if (isSelected(item)) {
            selectedItems = selectedItems.filter(i => i.id !== item.id);
        } else {
            selectedItems = [...selectedItems, item];
        }
    };
</script>

<DeletionModal bind:isVisible={isDeletionModalShown} {selectedItems}/>

<main class="w-full min-h-screen bg-admin-bg-primary text-admin-text-secondary font-sans">
    <div class="max-w-6xl mx-auto p-6 flex flex-col gap-4">
        <div class="py-4 border-b border-admin-border-primary">
            <h2 class="text-2xl font-normal text-admin-text-primary tracking-tight">Item Management</h2>
        </div>

        <div class="bg-admin-bg-secondary border border-admin-border-primary rounded overflow-hidden">
            <div class="flex items-center justify-end gap-3 px-4 py-3">
                <div class="flex items-center gap-3">
                    {#if selectedItems.length > 0}
                        <span class="text-xs text-admin-text-muted">
                            {selectedItems.length} selected
                        </span>
                        <div class="w-px h-4 bg-admin-border-primary"></div>
                    {/if}
                    <button onclick={() => isDeletionModalShown = true}
                        disabled={selectedItems.length === 0}
                        class="flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm transition-colors
                               {selectedItems.length === 0 
                                   ? 'bg-admin-border-primary text-admin-text-muted cursor-not-allowed' 
                                   : 'bg-admin-danger-bg text-admin-danger-text hover:bg-admin-danger-bg-hover cursor-pointer'}">
                        <BinIconSvg options={{ class: "h-4 w-4 stroke-[1] stroke-admin-text-secondary" }}/>
                        <span>Delete</span>
                    </button>
                </div>
                <button onclick={() => goto('items/create-item')}
                    class="flex items-center gap-2 px-4 py-1.5 bg-admin-accent-primary text-white text-sm rounded-sm cursor-pointer transition-colors hover:bg-admin-accent-primary-hover">
                    <CrossIconSvg options={{ class: "w-4 h-4 stroke-[2] rotate-45 stroke-admin-text-secondary "}}/>
                    <span>Create Item</span>
                </button>
            </div>
        </div>

        <div class="bg-admin-bg-secondary border border-admin-border-primary rounded overflow-hidden">
            <div class="flex items-center px-4 py-2.5 bg-admin-bg-tertiary border-b border-admin-border-primary text-xs font-semibold text-admin-text-muted uppercase tracking-wider">
                <div class="w-10 flex justify-center items-center">
                    <input type="checkbox" 
                        checked={selectAll}
                        onchange={toggleSelectAll}
                        class="w-4 h-4 rounded border-admin-border-primary bg-admin-border-primary accent-admin-accent-primary cursor-pointer"
                    />
                </div>
                <div class="w-full flex flex-row divide-solid-white divide-x-1 px-3">
                    <div class="w-0"></div>
                    <div class="w-full flex justify-center">Name</div>
                    <div class="w-full flex justify-center">Created at</div>
                    <div class="w-full flex justify-center">Created by</div>
                    <div class="w-full flex justify-center">Item id</div>
                    <div class="w-0"></div>
                </div>
                <button class="w-9 h-5 flex justify-center item-center">
                    <SettingsIconSvg options={{ class: "h-full w-full stroke-[2] stroke-admin-text-secondary" }}/>
                </button>
            </div>

            <div class="max-h-[60vh] overflow-y-auto">
                {#if $itemQuery.isLoading}
                    <div class="flex items-center justify-center py-12 text-admin-text-muted">
                        <SpinnerIconSvg/>
                        <span>Loading...</span>
                    </div>
                {:else if $itemQuery.data?.length === 0}
                    <div class="flex flex-col items-center justify-center py-12 text-admin-text-muted">
                        <span class="text-sm">No items found</span>
                    </div>
                {:else}
                {#each $itemQuery.data ?? [] as item}
                    <div class="flex items-center px-4 py-3 border-b border-admin-border-primary last:border-b-0 transition-colors hover:bg-[#2a2d2e] {isSelected(item) ? 'bg-[#094771]/30' : ''}">
                        <div class="w-10 flex justify-center">
                            <input type="checkbox" checked={isSelected(item)} onchange={() => toggleItem(item)}
                                class="w-4 h-4 rounded border-admin-border-primary bg-admin-border-primary accent-admin-accent-primary cursor-pointer"/>
                        </div>
                        <div class="w-full flex flex-row px-3">
                            <div class="w-full flex justify-start px-4 items-center">
                                <a href={`items/item-details?itemId=${item.id}`}
                                class="text-sm text-admin-accent-link hover:underline">
                                    {item.itemName}
                                </a>
                            </div>
                            <div class="w-full text-sm text-admin-text-muted flex justify-start px-4 items-center">{item.createdAt}</div>
                            <div class="w-full text-sm text-admin-text-muted flex justify-start px-4 items-center">Created by</div>
                            <div class="w-full text-sm text-admin-text-muted flex justify-start line-clamp-1 overflow-x-hidden px-4 items-center">{item.id}</div>
                        </div>
                        <div class="w-5 h-5 flex justify-center item-center">
                        </div>
                    </div>
                {/each}
                {/if}

                <div 
                    {@attach node => {
                        const observer = new IntersectionObserver((entries) => {
                            if (entries[0]?.isIntersecting && $itemQuery.hasNextPage) {
                                $itemQuery.fetchNextPage();
                            }
                        }, {
                            rootMargin: '120px',
                            threshold: 0
                        });
                        observer.observe(node);
                        return () => observer.disconnect();
                    }} 
                    class="h-1"></div>

                {#if $itemQuery.isFetchingNextPage}
                    <div class="flex items-center justify-center py-4 text-admin-text-muted text-sm">
                        <SpinnerIconSvg/>
                        <span>Loading more...</span>
                    </div>
                {/if}
            </div>
        </div>

        {#if $itemQuery.data}
            <div class="text-xs text-admin-text-muted px-1">
                Showing {$itemQuery.data.length} items
            </div>
        {/if}
    </div>
</main>