<script lang='ts'>
	import { clickOutside } from "$lib/actions/clickOutside";
	import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import EmptyIconSvg from "$lib/svg/EditorComponentIcons/EmptyIconSvg.svelte";
	import StopwatchIconSvg from "$lib/svg/EditorComponentIcons/StopwatchIconSvg.svelte";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
	import { createInfiniteQuery } from "@tanstack/svelte-query";
	import { fly } from "svelte/transition";

    let { 
        problemId,
        isVisible = $bindable(),
        restorePreviousSolutionCallback, 
        unloadPreviousSolutionCallback,
        currentlyLoadedSolution = $bindable()
    }: { problemId: string | undefined, isVisible: boolean, restorePreviousSolutionCallback: (solutionId: string) => Promise<void>, unloadPreviousSolutionCallback: (() => void), currentlyLoadedSolution?: string } = $props();

    type PreviousAttemptDto = {
        userSolutionId: string,
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
    
    let isCurrentlyRestoring: boolean = $state(false);

    function formatRelativeTime(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
</script>

<main 
    use:clickOutside={() => isVisible = false} 
    transition:fly={{y: -10, duration: 150}} 
    class="top-full mt-2 absolute z-100 w-72 max-h-80 bg-ide-bg overflow-hidden border border-ide-accent/30 rounded-xl shadow-2xl shadow-black/50 flex flex-col"
>
    <div class="px-4 py-3 border-b border-ide-accent/20 bg-ide-card sticky top-0">
        <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-text-primary">Previous Attempts</span>
            <span class="ml-auto text-xs text-text-secondary/70 bg-ide-dcard px-2 py-0.5 rounded-full">
                {$previousAttemptsQuery.data?.length ?? 0}
            </span>
        </div>
    </div>

    <div class="overflow-y-auto flex-1 flex flex-col-reverse">
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
            {@const isLoaded = attempt.userSolutionId === currentlyLoadedSolution}
            {@const isRestoring = isCurrentlyRestoring && isLoaded}
            <div 
                class="group px-4 py-3 shrink-0 flex flex-row items-center justify-between transition-colors duration-150
                       {isLoaded ? 'bg-ide-accent/10 border-l-2 border-l-ide-accent' : 'hover:bg-ide-card border-l-2 border-l-transparent'}"
            >
                <div class="flex flex-col gap-0.5 min-w-0">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-medium text-text-primary truncate">
                            {new Date(attempt.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                            })}
                        </span>
                        {#if isLoaded && !isRestoring}
                            <span class="text-[10px] uppercase tracking-wider text-ide-accent bg-ide-accent/15 px-1.5 py-0.5 rounded font-medium">
                                Active
                            </span>
                        {/if}
                    </div>
                    <div class="flex items-center gap-3 text-xs text-text-secondary/60">
                        <span class="flex items-center gap-1">
                            <StopwatchIconSvg options={{ class: 'w-3 h-3 stroke-ide-accent/70 stroke-[2]'}}/>
                            {(attempt.codeRuntimeSubmitted / 1_000_000).toFixed(2)}ms
                        </span>
                        <span>{formatRelativeTime(attempt.createdAt)}</span>
                    </div>
                </div>
                
                <div class="shrink-0 ml-3">
                    {#if isRestoring}
                        <div class="flex items-center gap-2 text-xs text-text-secondary/70">
                            <div class="w-3.5 h-3.5 border-2 border-ide-dcard border-t-ide-accent rounded-full animate-spin"></div>
                        </div>
                    {:else if isLoaded}
                        <button 
                            onclick={() => {
                                unloadPreviousSolutionCallback();
                                currentlyLoadedSolution = undefined;
                            }}
                            class="text-xs px-3 py-1.5 rounded-lg bg-ide-dcard text-text-secondary hover:bg-ide-accent/20 hover:text-text-primary transition-all duration-150 font-medium"
                        >
                            Unload
                        </button>
                    {:else}
                        <button 
                            onclick={async () => {
                                isCurrentlyRestoring = true;
                                currentlyLoadedSolution = attempt.userSolutionId;
                                await restorePreviousSolutionCallback(attempt.userSolutionId);
                                isCurrentlyRestoring = false;
                            }}
                            class="text-xs px-3 py-1.5 rounded-lg bg-transparent border border-ide-accent/30 text-text-secondary/80 
                                   hover:bg-ide-accent/15 hover:border-ide-accent/60 hover:text-ide-accent 
                                   transition-all duration-150 font-medium opacity-0 group-hover:opacity-100"
                        >
                            Restore
                        </button>
                    {/if}
                </div>
            </div>
        {:else}
            <div class="w-full py-12 flex flex-col items-center justify-center gap-2">
                <EmptyIconSvg options={{ class: 'w-10 h-10 stroke-[3] stroke-ide-accent/30'  }}/>
                <span class="text-sm text-text-secondary/70">No attempts yet</span>
                <span class="text-xs text-text-secondary/40">Submit a solution to see it here</span>
            </div>
        {/each}
    </div>

    {#if $previousAttemptsQuery.isFetchingNextPage}
        <div class="px-4 py-2 border-t border-ide-accent/20 flex items-center justify-center gap-2">
            <div class="w-3 h-3 border-2 border-ide-dcard border-t-ide-accent rounded-full animate-spin"></div>
            <span class="text-xs text-text-secondary/60">Loading more...</span>
        </div>
    {/if}
</main>