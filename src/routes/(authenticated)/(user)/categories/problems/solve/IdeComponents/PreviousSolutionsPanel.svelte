<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import EmptyIconSvg from '$lib/svg/EditorComponentIcons/EmptyIconSvg.svelte';
	import StopwatchIconSvg from '$lib/svg/EditorComponentIcons/StopwatchIconSvg.svelte';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { fly } from 'svelte/transition';

	let {
		problemId,
		isVisible = $bindable(),
		restorePreviousSolutionCallback,
		unloadPreviousSolutionCallback,
		currentlyLoadedSolution = $bindable()
	}: {
		problemId: string | undefined;
		isVisible: boolean;
		restorePreviousSolutionCallback: (solutionId: string) => Promise<void>;
		unloadPreviousSolutionCallback: () => void;
		currentlyLoadedSolution?: string;
	} = $props();

	type PreviousAttemptDto = {
		userSolutionId: string;
		createdAt: Date;
		codeRuntimeSubmitted: number;
	};

	const previousAttemptsQuery = createInfiniteQuery({
		queryKey: ['previous attempts', problemId],
		initialPageParam: 1,
		queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
			return await FetchFromApi<CustomPageData<PreviousAttemptDto>>(
				'UserSolutions',
				{
					method: 'GET'
				},
				fetch,
				new URLSearchParams({
					problemId: problemId!,
					pageSize: '12',
					currentPage: pageParam.toString()
				})
			);
		},
		getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<PreviousAttemptDto>>) =>
			firstPage.body.prevCursor ?? undefined,
		getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<PreviousAttemptDto>>) =>
			lastPage.body.nextCursor ?? undefined,
		select: (data: any) =>
			data.pages
				.map((p: StandardResponseDto<CustomPageData<PreviousAttemptDto>>) => p.body.items)
				.flat() as PreviousAttemptDto[],
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
	use:clickOutside={() => (isVisible = false)}
	transition:fly={{ y: -10, duration: 150 }}
	class="absolute top-full z-100 mt-2 flex max-h-80 w-72 flex-col overflow-hidden rounded-xl border border-ide-accent/30 bg-ide-bg shadow-2xl shadow-black/50"
>
	<div class="sticky top-0 border-b border-ide-accent/20 bg-ide-card px-4 py-3">
		<div class="flex items-center gap-2">
			<span class="text-text-primary text-sm font-medium">Previous Attempts</span>
			<span class="text-text-secondary/70 ml-auto rounded-full bg-ide-dcard px-2 py-0.5 text-xs">
				{$previousAttemptsQuery.data?.length ?? 0}
			</span>
		</div>
	</div>

	<div class="flex flex-1 flex-col-reverse overflow-y-auto">
		<div
			{@attach (node) => {
				const container: HTMLElement | null = node.parentElement;
				if (!container) return;
				const observer = new IntersectionObserver(
					(entries) => {
						if (entries[0]?.isIntersecting) {
							$previousAttemptsQuery.fetchNextPage();
						}
					},
					{
						root: container,
						rootMargin: '120px',
						threshold: 0
					}
				);

				observer.observe(node);
				return () => observer.disconnect();
			}}
			class="h-1 w-full shrink-0"
		></div>

		{#each ($previousAttemptsQuery.data ?? []) as PreviousAttemptDto[] as attempt, i}
			{@const isLoaded = attempt.userSolutionId === currentlyLoadedSolution}
			{@const isRestoring = isCurrentlyRestoring && isLoaded}
			<div
				class="group flex shrink-0 flex-row items-center justify-between px-4 py-3 transition-colors duration-150
                       {isLoaded
					? 'border-l-2 border-l-ide-accent bg-ide-accent/10'
					: 'border-l-2 border-l-transparent hover:bg-ide-card'}"
			>
				<div class="flex min-w-0 flex-col gap-0.5">
					<div class="flex items-center gap-2">
						<span class="text-text-primary truncate text-sm font-medium">
							{new Date(attempt.createdAt).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
								hour: 'numeric',
								minute: '2-digit'
							})}
						</span>
						{#if isLoaded && !isRestoring}
							<span
								class="rounded bg-ide-accent/15 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-ide-accent uppercase"
							>
								Active
							</span>
						{/if}
					</div>
					<div class="text-text-secondary/60 flex items-center gap-3 text-xs">
						<span class="flex items-center gap-1">
							<StopwatchIconSvg options={{ class: 'w-3 h-3 stroke-ide-accent/70 stroke-[2]' }} />
							{(attempt.codeRuntimeSubmitted / 1_000_000).toFixed(2)}ms
						</span>
						<span>{formatRelativeTime(attempt.createdAt)}</span>
					</div>
				</div>

				<div class="ml-3 shrink-0">
					{#if isRestoring}
						<div class="text-text-secondary/70 flex items-center gap-2 text-xs">
							<div
								class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ide-dcard border-t-ide-accent"
							></div>
						</div>
					{:else if isLoaded}
						<button
							onclick={() => {
								unloadPreviousSolutionCallback();
								currentlyLoadedSolution = undefined;
							}}
							class="text-text-secondary hover:text-text-primary rounded-lg bg-ide-dcard px-3 py-1.5 text-xs font-medium transition-all duration-150 hover:bg-ide-accent/20"
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
							class="text-text-secondary/80 rounded-lg border border-ide-accent/30 bg-transparent px-3 py-1.5 text-xs
                                   font-medium opacity-0 transition-all
                                   duration-150 group-hover:opacity-100 hover:border-ide-accent/60 hover:bg-ide-accent/15 hover:text-ide-accent"
						>
							Restore
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<div class="w-full py-12 flex flex-col items-center justify-center gap-2">
				<EmptyIconSvg options={{ class: 'w-10 h-10 stroke-[3] stroke-ide-accent/30' }} />
				<span class="text-sm text-text-secondary/70">No attempts yet</span>
				<span class="text-xs text-text-secondary/40">Submit a solution to see it here</span>
			</div>
		{/each}
	</div>

	{#if $previousAttemptsQuery.isFetchingNextPage}
		<div class="flex items-center justify-center gap-2 border-t border-ide-accent/20 px-4 py-2">
			<div
				class="h-3 w-3 animate-spin rounded-full border-2 border-ide-dcard border-t-ide-accent"
			></div>
			<span class="text-text-secondary/60 text-xs">Loading more...</span>
		</div>
	{/if}
</main>
