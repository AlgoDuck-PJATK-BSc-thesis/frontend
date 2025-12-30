<script lang="ts">
	import { createInfiniteQuery } from "@tanstack/svelte-query";
	import type { ItemType, OwnedDuck } from "./duckTypes";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
	import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import DuckSelectionTile from "./DuckSelectionTile.svelte";

    let { options }: { options: { onclick: (() => Promise<void>) } } = $props();

    const infiniteQuery = createInfiniteQuery({
        queryKey: [ "OwnedDucks" ],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
            return await FetchFromApi<CustomPageData<OwnedDuck>>("OwnedDucks", { 
                method: "GET" 
            },fetch, new URLSearchParams({ page: `${pageParam}`, pageSize: "12" }));  
        },
        getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<OwnedDuck>>) => firstPage.body.prevCursor ?? undefined,
        getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<OwnedDuck>>) => lastPage.body.nextCursor ?? undefined,
        select: (data: any) => data.pages.map((p: any) => p.body.items).flat()
    });

    // $inspect($infiniteQuery.data)
</script>

<main>
	<div class="flex flex-col h-full">
		<div class="w-full h-12 px-3 flex-shrink-0">
			<h4 class="text-lg font-semibold border-b-2 border-b-black py-2">Owned ducks</h4>
		</div>
		<div class="w-full flex-1 min-h-0 p-5 grid grid-cols-4 gap-3 overflow-y-auto">
			{#each $infiniteQuery.data as duck}
				<DuckSelectionTile options={{ 
					duck: duck,
					onclick: async () => {
					await options.onclick();
				}}}/>
			{/each}
		</div>
	</div>
</main>
