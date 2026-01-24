<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import Podium from './podium.svelte';
	import type { LeaderboardItem, TopUser } from '../types';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { get } from 'svelte/store';
	import {
		userQueryOptions,
		type UserLeaderboardEntryDto,
		type UserLeaderboardPageDto
	} from '$lib/api/user';

	let {
		starSrc,
		onProfile,
		onProfileKey,
		pageSize = 20,
		fetcher,
		sentinel = $bindable(null)
	} = $props<{
		starSrc: string;
		onProfile: (userId: string) => void;
		onProfileKey: (e: KeyboardEvent, userId: string) => void;
		pageSize?: number;
		fetcher?: typeof fetch;
		sentinel?: HTMLElement | null;
	}>();

	const q = createInfiniteQuery(userQueryOptions.globalLeaderboardInfinite(pageSize, fetcher));

	const pages = $derived(($q.data?.pages ?? []) as UserLeaderboardPageDto[]);

	const entries = $derived(
		pages.flatMap((p: UserLeaderboardPageDto) => p.entries ?? []) as UserLeaderboardEntryDto[]
	);

	const items = $derived(
		entries.map(
			(e: UserLeaderboardEntryDto) =>
				({
					rank: e.rank,
					userId: e.userId,
					username: e.username,
					points: e.experience,
					avatarKey: e.userAvatarUrl ?? ''
				}) as LeaderboardItem
		)
	);

	const topUsers = $derived(
		items.slice(0, 3).map(
			(u: LeaderboardItem) =>
				({
					userId: (u as unknown as { userId?: string }).userId ?? '',
					username: u.username,
					points: u.points,
					avatarKey: (u as unknown as { avatarKey?: string }).avatarKey ?? ''
				}) as TopUser
		)
	);

	type NextPageState = {
		hasNextPage?: boolean;
		isFetchingNextPage?: boolean;
		isPending?: boolean;
		fetchNextPage?: () => Promise<unknown>;
	};

	$effect(() => {
		if (typeof window === 'undefined') return;
		if (!sentinel) return;
		if (typeof IntersectionObserver === 'undefined') return;

		const observer = new IntersectionObserver(
			(list: IntersectionObserverEntry[]) => {
				const first = list[0];
				if (!first?.isIntersecting) return;

				const state = get(q) as NextPageState;

				if (!state.hasNextPage) return;
				if (state.isFetchingNextPage) return;
				if (state.isPending) return;

				state.fetchNextPage?.();
			},
			{ rootMargin: '400px' }
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	});
</script>

<PixelFrameSimple
	className="relative mb-10 flex h-max w-full max-w-2xl flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-2 pb-6 text-[color:var(--color-landingpage-subtitle)]"
>
	{#if $q.isPending && items.length === 0}
		<div class="mx-auto flex w-full max-w-[40rem] items-center justify-center px-8 py-10">
			<LoadingDots />
		</div>
	{:else}
		<Podium {topUsers} />

		{#each items as user, i (user.userId ?? user.rank ?? i)}
			<div
				class={`mx-auto mb-1 flex w-full max-w-[40rem] items-center justify-between rounded py-2 pr-8 ${i === items.length - 1 ? 'mb-2' : ''}`}
			>
				<div class="flex items-center gap-3">
					<span class="min-w-[3.5rem] text-right">{user.rank}.</span>

					<div
						class="h-12 w-12 shrink-0 overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
						role="button"
						tabindex="0"
						aria-label="View profile"
						onclick={() => onProfile((user.userId ?? '').toString())}
						onkeydown={(e) => onProfileKey(e, (user.userId ?? '').toString())}
					>
						<CloudfrontImage
							path={(user as unknown as { avatarKey?: string }).avatarKey ?? ''}
							cls="h-full w-full -translate-x-[-10%] -translate-y-[0%] scale-[1.5] object-cover object-[left_top]"
						/>
					</div>

					<span
						class="text scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[20rem] cursor-pointer overflow-x-auto whitespace-nowrap hover:underline"
						role="button"
						tabindex="0"
						aria-label="View profile"
						onclick={() => onProfile((user.userId ?? '').toString())}
						onkeydown={(e) => onProfileKey(e, (user.userId ?? '').toString())}
					>
						{user.username}
					</span>
				</div>

				<PixelFrameMini
					className="flex items-center gap-1 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
				>
					<span>{user.points}</span>
					<img
						src={starSrc}
						alt="points"
						class="ml-1 inline-block h-[1.1rem] w-[1.1rem] shrink-0 align-[-0.2em]"
					/>
				</PixelFrameMini>
			</div>
		{/each}

		<div bind:this={sentinel} class="h-12 w-full"></div>

		{#if $q.isFetchingNextPage}
			<div
				class="mx-auto mb-2 flex w-full max-w-[40rem] items-center justify-center px-8 py-3 text-center text-sm opacity-80"
			>
				<LoadingDots />
			</div>
		{/if}
	{/if}
</PixelFrameSimple>
