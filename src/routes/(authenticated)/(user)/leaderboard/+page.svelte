<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import { userApi } from '$lib/api/user';

	import Background from './_parts/background.svelte';
	import List from './_parts/list.svelte';
	import { fetchLeaderboardPage } from './api';
	import { computeBackground } from './bg';
	import type { BgSegment, LeaderboardPage } from './types';
	import { normalizeToCloudfrontKey, toItems, topThree } from './util';

	const starSrc = '/headers/star.png';
	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;

	const gif1 = '/leaderboard/Global_ranking1.gif';
	const gif2 = '/leaderboard/Global_ranking2.gif';
	const gif3 = '/leaderboard/Global_ranking3.gif';

	const gifW = 2645;
	const gifH = 1368;
	const gifRatio = gifH / gifW;

	const goProfile = (userId: string) => {
		const id = (userId ?? '').toString().trim();
		if (!id) return;
		goto(`/user/${id}`);
	};

	const onProfileKey = (e: KeyboardEvent, userId: string) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			goProfile(userId);
		}
	};

	const leaderboardQuery = createInfiniteQuery({
		queryKey: ['globalLeaderboard'],
		initialPageParam: 0,
		queryFn: async ({ pageParam }: { pageParam: number }) => {
			const p = Number(pageParam ?? 0);
			return await fetchLeaderboardPage(p);
		},
		getNextPageParam: (lastPage: LeaderboardPage, allPages: LeaderboardPage[]) => {
			const total = Number(lastPage?.totalUsers ?? 0);
			const loaded = allPages.reduce(
				(sum: number, p: LeaderboardPage) => sum + (p?.entries?.length ?? 0),
				0
			);
			if (!total) return undefined;
			return loaded < total ? allPages.length : undefined;
		},
		refetchInterval: 20000,
		staleTime: 0
	});

	let myUserId = $state('');
	let myAvatarOverrideKey = $state('');

	const onAvatarEvent = (e: Event) => {
		const ce = e as CustomEvent;
		const key = normalizeToCloudfrontKey((ce?.detail ?? '').toString());
		if (key) myAvatarOverrideKey = key;
	};

	let scrollEl = $state<HTMLElement | null>(null);
	let contentEl = $state<HTMLDivElement | null>(null);
	let sentinelEl = $state<HTMLElement | null>(null);

	let bgSegments = $state<BgSegment[]>([]);
	let bgHeight = $state(0);

	let roScroll: ResizeObserver | null = null;
	let roContent: ResizeObserver | null = null;

	const items = $derived.by(() => {
		const pages = (($leaderboardQuery.data?.pages ?? []) as LeaderboardPage[]) ?? [];
		return toItems(pages, myUserId, myAvatarOverrideKey, defaultAvatar);
	});

	const topUsers = $derived.by(() => topThree(items));

	const recomputeBackground = () => {
		const r = computeBackground(scrollEl, gifRatio, gif1, gif2, gif3);
		bgHeight = r.bgHeight;
		bgSegments = r.segments;
	};

	$effect(() => {
		items.length;
		recomputeBackground();
	});

	$effect(() => {
		const root = scrollEl;
		const target = sentinelEl;
		if (!root || !target) return;

		const obs = new IntersectionObserver(
			(entries) => {
				if (!entries?.[0]?.isIntersecting) return;
				const v: any = $leaderboardQuery;
				if (v?.hasNextPage && !v?.isFetchingNextPage) {
					(leaderboardQuery as any).fetchNextPage?.();
				}
			},
			{ root, rootMargin: '600px 0px 600px 0px', threshold: 0 }
		);

		obs.observe(target);

		return () => {
			obs.disconnect();
		};
	});

	onMount(async () => {
		try {
			const me = await (userApi as any).getMe?.(fetch);
			myUserId = String((me?.userId ?? me?.profile?.userId ?? '') as any).trim();
		} catch {
			myUserId = '';
		}

		if (typeof window !== 'undefined') {
			window.addEventListener('algoduck:avatar', onAvatarEvent as EventListener);
		}

		if (scrollEl) {
			roScroll = new ResizeObserver(() => recomputeBackground());
			roScroll.observe(scrollEl);
		}

		if (contentEl) {
			roContent = new ResizeObserver(() => recomputeBackground());
			roContent.observe(contentEl);
		}

		recomputeBackground();
	});

	onDestroy(() => {
		if (roScroll) roScroll.disconnect();
		roScroll = null;

		if (roContent) roContent.disconnect();
		roContent = null;

		if (typeof window !== 'undefined') {
			window.removeEventListener('algoduck:avatar', onAvatarEvent as EventListener);
		}
	});
</script>

<svelte:head>
	<title>Global Leaderboard - AlgoDuck</title>
</svelte:head>

<section bind:this={scrollEl} class="font-body relative h-[calc(100vh-4rem)] overflow-y-auto">
	<Background {bgHeight} segments={bgSegments} />

	<div
		bind:this={contentEl}
		class="relative z-10 flex flex-col items-center gap-6 pt-12 pr-8 pb-8 pl-8"
	>
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-[14rem] ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Leaderboard
		</h1>

		<List
			{items}
			{topUsers}
			{starSrc}
			loadingMore={!!($leaderboardQuery as any).isFetchingNextPage}
			onProfile={goProfile}
			{onProfileKey}
			bind:sentinel={sentinelEl}
		/>
	</div>
</section>
