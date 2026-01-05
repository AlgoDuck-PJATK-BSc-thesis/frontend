<script lang='ts'>
	import { clickOutside } from "$lib/actions/clickOutside";
	import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
	import { createInfiniteQuery } from "@tanstack/svelte-query";
	import { fly } from "svelte/transition";

    let { problemId, isVisible = $bindable(), restorePreviousSolutionCallback }: { problemId: string | undefined, isVisible: boolean, restorePreviousSolutionCallback: () => Promise<void> } = $props();

    type PreviousAttemptDto = {
        attemptId: string,
        createdAt: Date,
        codeRuntimeSubmitted: number
    }    

    const previousAttemptsQuery = createInfiniteQuery({
        queryKey: [ "previous attempts", problemId ],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
            return await FetchFromApi<CustomPageData<PreviousAttemptDto>>("UserSolutions", {
                method: "GET"
            }, fetch, new URLSearchParams({ problemId: problemId!, pageSize: "12", currentPage: pageParam.toString() }))
        },
        getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<PreviousAttemptDto>>) => firstPage.body.prevCursor ?? undefined,
        getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<PreviousAttemptDto>>) => lastPage.body.nextCursor ?? undefined,
        select: (data: any) => data.pages.map((p: StandardResponseDto<CustomPageData<PreviousAttemptDto>>) => p.body.items).flat() as PreviousAttemptDto[],
        get enabled() {
            return !!problemId;
        }
    });
    $inspect($previousAttemptsQuery.data);

</script>

<main use:clickOutside={() => isVisible = false} transition:fly={{y: -30, duration: 200}} class="top-full absolute z-100 w-40 max-h-60 bg-ide-bg overflow-y-auto border border-ide-accent rounded-lg flex flex-col-reverse">
    <div {@attach (node) => {
        const container: HTMLElement | null = node.parentElement;
        if (!container) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) {
                $previousAttemptsQuery.fetchNextPage();
            }
        }, {
            root: container,
            rootMargin: '120px',
            threshold: 0
        });
        
        observer.observe(node);
        return () => observer.disconnect();
    }} class="h-1 w-full shrink-0"></div>
    
    {#each $previousAttemptsQuery.data as attempt, i}
        <button class="w-full h-15 shrink-0 {i % 2 === 0 ? 'bg-red-500' : 'bg-blue-500'}">
            blah blah blah
        </button>

    {:else}
        <div class="w-full h-15 flex justify-center items-center">
            <span>No attempts yet</span>
        </div>
    {/each}
</main>