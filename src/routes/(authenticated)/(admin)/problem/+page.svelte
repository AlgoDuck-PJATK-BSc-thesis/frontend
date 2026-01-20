<script lang='ts'>
	import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
	import { createInfiniteQuery, useQueryClient } from "@tanstack/svelte-query";
	import { goto } from "$app/navigation";
	import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import SettingsIconSvg from "$lib/svg/SettingsIconSvg.svelte";
	import SpinnerIconSvg from "$lib/svg/EditorComponentIcons/SpinnerIconSvg.svelte";
	import { createColumnConfig } from "$lib/types/ComponentConfig";
    import type { ComponentConfigStatic } from "$lib/Components/GenericComponents/AutoCompleteInput/ComponentConfigStatic";
	import TriangleIconSvg from "$lib/svg/EditorComponentIcons/TriangleIconSvg.svelte";
	import { QueryableColumns, type CategoryDto, type CategoryPreviewDto, type CreatorDto, type DifficultyDto, type ProblemCreatorPreviewDto, type ProblemDto, type QueryableColumn } from "./problemTypes";
	import PopOverPreviewColumn from "../items/column-preview-comps/PopOverPreviewColumn.svelte";
	import RegularColumn from "../items/column-preview-comps/RegularColumn.svelte";
	import LinkColumn from "../items/column-preview-comps/LinkColumn.svelte";
	import ColumnSelectDialog from "./ColumnSelectDialog.svelte";
	import DeletionModal from "./DeletionModal.svelte";
	import CategoryPreviewCard from "./CategoryPreviewCard.svelte";
	import ProblemCreatorPreviewCard from "./ProblemCreatorPreviewCard.svelte";

    let totalItems: number = $state(0);
    const queryClient = useQueryClient();

    let columnPicker: Record<QueryableColumn, boolean> = $state({
        ...Object.fromEntries(QueryableColumns.map((q) => [q, true])) as Record<QueryableColumn, boolean>,
        "createdBy": false
    });
    let orderBy: string | null = $state(null)


    const fetchAndUpdateCache = async (colsNeeded: QueryableColumn[], orderByCapture: string | null, pageParam: number) => {
        const params: URLSearchParams = new URLSearchParams({ columns: colsNeeded.join(), pageSize: "12", currentPage: pageParam.toString() });
        if (orderByCapture) params.set("orderBy", orderByCapture);

        let res = await FetchFromApi<CustomPageData<ProblemDto>>("ProblemDetailsAdmin", {
            method: "GET"
        }, fetch, params);
        queryClient.setQueryData(["column", "problem", "PageData", pageParam, orderByCapture], {
            currPage: res.body.currPage,
            pageSize: res.body.pageSize,
            totalItems: res.body.totalItems,
            nextCursor: res.body.nextCursor,
            prevCursor: res.body.prevCursor,
        });

        colsNeeded.forEach((col) => {
            const colValues: Record<string, Partial<ProblemDto>> = Object.fromEntries(res.body.items.map(i => [i.problemId, { [col]: i[col] }]))
            queryClient.setQueryData(["column", "problem", col, pageParam, orderByCapture], colValues)
        })


        totalItems = res.body.totalItems;
        return res;
    }

    const itemQuery = $derived(createInfiniteQuery({
        queryKey: ["all", "problem", "columns", orderBy],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
            const orderByCapture: string = orderBy ?? "None";
            const columnPickerCapture: Record<QueryableColumn, boolean> = columnPicker;

            const selectedCols: QueryableColumn[] = Object.entries(columnPickerCapture).filter(([k, v]) => v).map(([k, v]) => k as QueryableColumn);
            const cachedCols: QueryableColumn[] = selectedCols.filter(c => queryClient.getQueryData(["column", "problem", c, pageParam, orderByCapture]))
            const colsNeeded: QueryableColumn[] = selectedCols.filter(col => !cachedCols.includes(col))

            if (cachedCols.length === 0){
                return await fetchAndUpdateCache(colsNeeded, orderByCapture, pageParam);
            }

            if (colsNeeded.length === 0){
                let itemData: Record<string, Partial<ProblemDto>> | undefined;

                selectedCols.forEach(col => {
                    const currentRow = queryClient.getQueryData(["column", "problem", col, pageParam, orderByCapture]) as Record<string, Partial<ProblemDto>>;
                    if (!itemData){
                        itemData = { ...currentRow };
                        return;
                    }
                    Object.entries(currentRow).forEach(([k, v]) => {
                        itemData![k] = {
                            ...itemData![k],
                            ...v
                        }
                    })
                });
                return {
                    message: "Success",
                    body:{
                        ...queryClient.getQueryData(["column", "problem", "PageData", pageParam, orderByCapture]) as Partial<CustomPageData<ProblemDto>>,
                        items: Object.values(itemData!)
                    }
                } as StandardResponseDto<CustomPageData<ProblemDto>>
            }

            
            let res = await fetchAndUpdateCache(colsNeeded, orderByCapture, pageParam);
            
            cachedCols.forEach((col) => {
                const currentRow = queryClient.getQueryData(["column", "problem", col, pageParam, orderByCapture]) as Record<string, Partial<ProblemDto>>;
                Object.entries(currentRow).forEach(([k, v]) => {
                    const item: number = res.body.items.findIndex(i => i.problemId === k)
                    if (item === -1) return;
                    res.body.items[item] = {
                        ...res.body.items[item],
                        ...v
                    }
                });
            });

            return res;
        },
        getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<ProblemDto>>) => firstPage.body.prevCursor ?? undefined,
        getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<ProblemDto>>) => lastPage.body.nextCursor ?? undefined,
        select: (data: any) => data.pages.map((p: StandardResponseDto<CustomPageData<ProblemDto>>) => p.body.items).flat() as ProblemDto[],
        get enabled(){
            return Object.values(columnPicker ?? {}).filter(v => v).length > 0;
        }
    }));

    let selectedItems: ProblemDto[] = $state([]);
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

    const isSelected = (item: ProblemDto) => selectedItems.some(i => i.problemId === item.problemId);

    const toggleItem = (item: ProblemDto) => {
        if (isSelected(item)) {
            selectedItems = selectedItems.filter(i => i.problemId !== item.problemId);
        } else {
            selectedItems = [...selectedItems, item];
        }
    };

    let isPreferencesShown: boolean = $state(false);

    const updateColumnSelection = (newCols: Record<QueryableColumn, boolean>) => {
        columnPicker = newCols;
        $itemQuery.refetch();
    }

</script>

<DeletionModal bind:isVisible={isDeletionModalShown} {selectedItems}/>

<main class="w-full min-h-full bg-admin-bg-primary text-admin-text-secondary">
    <div class="max-w-6xl mx-auto p-6 flex flex-col gap-4">
        <div class="py-4 border-b border-admin-border-primary">
            <h2 class="text-2xl font-normal text-admin-text-primary tracking-tight">Problem Management</h2>
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
                <button onclick={() => goto('problem/upsert')}
                    class="flex items-center gap-2 px-4 py-1.5 bg-admin-accent-primary text-white text-sm rounded-sm cursor-pointer transition-colors hover:bg-admin-accent-primary-hover">
                    <CrossIconSvg options={{ class: "w-4 h-4 stroke-[2] rotate-45 stroke-admin-text-secondary "}}/>
                    <span>Create Problem</span>
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
                    {#each Object.entries(columnPicker).filter(([k, v]) => v) as column}
                        {@const columnName = column[0] as keyof ProblemDto}
                        {@const isOrderedBy = orderBy === columnName}
                        <button onclick={() => {
                            if (!isOrderedBy){
                                orderBy = columnName
                            }else{
                                orderBy = null
                            }
                        }} class="w-full relative flex justify-center items-center">
                            <span>{columnName}</span>
                            <div class="absolute right-3 w-3 h-3 {isOrderedBy ? "rotate-180" : ""}">
                                <TriangleIconSvg options={{ class: 'w-full h-full stroke-[2] stroke-admin-text-muted' }}/>
                            </div>
                        </button>
                    {/each}
                    <div class="w-0"></div>
                </div>
                <button onclick={() => isPreferencesShown = !isPreferencesShown} class="w-9 h-5 flex justify-center item-center relative">
                    <div class="w-full h-full hover:cursor-pointer">
                        <SettingsIconSvg options={{ class: "h-full w-full stroke-[2] stroke-admin-text-secondary" }}/>
                    </div>
                    {#if isPreferencesShown}                        
                        <div class="absolute top-7 -right-2">
                            <ColumnSelectDialog columnPicker={$state.snapshot(columnPicker)} bind:isVisible={isPreferencesShown} {updateColumnSelection}/>
                        </div>
                    {/if}
                </button>
            </div>

            <div class="max-h-[60vh] min-h-[50vh] overflow-y-auto">
                {#if $itemQuery.isLoading}
                    <div class="flex items-center justify-center py-12 text-admin-text-muted gap-3">
                        <div class="w-4 h-4 rounded-full border-2 border-admin-text-muted border-t-admin-text-primary animate-spin"></div>
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
                                {#each Object.entries(columnPicker).filter(([k, v]) => v) as column}
                                    {@const ColumnName = column[0] as keyof ProblemDto}
                                    {@const value = item[ColumnName]}

                                    {@const ColumnValueFormatted = ({
                                        'createdBy': (value: CreatorDto | null) => value 
                                            ? createColumnConfig(PopOverPreviewColumn, { 
                                                label: value.username, 
                                                displayComponent: ProblemCreatorPreviewCard, 
                                                getPreviewData: async () => {
                                                    return await FetchFromApi<ProblemCreatorPreviewDto>("problem/creator/preview", { 
                                                        method: "GET"
                                                    }, fetch, new URLSearchParams({ userId: value.id }))
                                                }
                                            })
                                            : createColumnConfig(RegularColumn, { label: 'Loading...' }),
                                        'createdOn': (value: Date) => createColumnConfig(RegularColumn, { label: (new Date(value ?? Date.now())).toLocaleDateString() }),
                                        'problemId': (value: string) => createColumnConfig(LinkColumn, { label: value, href: `problem/problem-details?problemId=${value}` }),
                                        'name': (value: string) => createColumnConfig(RegularColumn, { label: value }),
                                        'difficulty': (value: DifficultyDto) => createColumnConfig(RegularColumn, { label: value.name }),
                                        'category': (value: CategoryDto) => createColumnConfig(PopOverPreviewColumn, { label: value.name, displayComponent: CategoryPreviewCard, getPreviewData: async () => {
                                            return await FetchFromApi<CategoryPreviewDto>("problem/category/preview", { 
                                                method: "GET"
                                            }, fetch , new URLSearchParams({ categoryId: value.categoryId}))                                            
                                        } }),
                                        'completionRatio': (value: string) => createColumnConfig(RegularColumn, { label: `${(parseFloat(value) * 100).toFixed(1)}%` })
                                    } as Record<keyof ProblemDto, (<P extends Record<string, any>>(value: any) => ComponentConfigStatic<P>)>)[ColumnName](value)}
                                    {@const Comp = ColumnValueFormatted.component}
                                    <Comp options={ColumnValueFormatted.options}/>

                                {/each}
                            </div>
                            <div class="w-9 h-5 flex justify-center item-center"></div>
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
                Showing {$itemQuery.data.length} - {totalItems} items
            </div>
        {/if}
    </div>
</main>

<svelte:head>
	<title>Admin - Algoduck</title>
</svelte:head>