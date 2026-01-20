<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { userApi, type UserLeaderboardEntryDto } from '$lib/api/user';
	import { goto } from '$app/navigation';
	import { createInfiniteQuery } from '@tanstack/svelte-query';

	const starSrc = '/headers/star.png';
	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;

	const gif1 = '/leaderboard/Global_ranking1.gif';
	const gif2 = '/leaderboard/Global_ranking2.gif';
	const gif3 = '/leaderboard/Global_ranking3.gif';

	const gifW = 2645;
	const gifH = 1368;
	const gifRatio = gifH / gifW;

	const normalizeToCloudfrontKey = (value: string): string => {
		const v = (value ?? '').toString().trim();
		if (!v) return '';
		if (v.startsWith('http://') || v.startsWith('https://')) {
			try {
				const u = new URL(v);
				const p = (u.pathname ?? '').replace(/^\/+/, '').trim();
				return p || '';
			} catch {
				return '';
			}
		}
		return v;
	};

	const pointsOf = (u: UserLeaderboardEntryDto) => u.experience;

	const goProfile = (userId: string) => {
		if (!userId) return;
		goto(`/user/${userId}`);
	};

	const onProfileKey = (e: KeyboardEvent, userId: string) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			goProfile(userId);
		}
	};

	const pageSize = 40;

	const fetchLeaderboardPage = async (page: number) => {
		const ua = userApi as any;

		if (typeof ua.getGlobalLeaderboard === 'function') {
			try {
				const r = await ua.getGlobalLeaderboard(page, pageSize);
				const entries = (r?.entries ?? r?.items ?? []) as UserLeaderboardEntryDto[];
				const totalUsers = Number(r?.totalUsers ?? r?.totalItems ?? entries.length);
				return { entries, totalUsers, page };
			} catch {}
			try {
				const r = await ua.getGlobalLeaderboard(fetch, page, pageSize);
				const entries = (r?.entries ?? r?.items ?? []) as UserLeaderboardEntryDto[];
				const totalUsers = Number(r?.totalUsers ?? r?.totalItems ?? entries.length);
				return { entries, totalUsers, page };
			} catch {}
			try {
				const r = await ua.getGlobalLeaderboard(page + 1, pageSize);
				const entries = (r?.entries ?? r?.items ?? []) as UserLeaderboardEntryDto[];
				const totalUsers = Number(r?.totalUsers ?? r?.totalItems ?? entries.length);
				return { entries, totalUsers, page };
			} catch {}
		}

		const all = (await userApi.getGlobalLeaderboardAll()) as UserLeaderboardEntryDto[];
		const start = page * pageSize;
		const entries = all.slice(start, start + pageSize);
		return { entries, totalUsers: all.length, page };
	};

	const leaderboardQuery = createInfiniteQuery({
		queryKey: ['globalLeaderboard'],
		initialPageParam: 0,
		queryFn: async ({ pageParam }: any) => {
			const p = Number(pageParam ?? 0);
			return await fetchLeaderboardPage(p);
		},
		getNextPageParam: (lastPage: any, allPages: any[]) => {
			const total = Number(lastPage?.totalUsers ?? 0);
			const loaded = allPages.reduce((sum, p) => sum + (p?.entries?.length ?? 0), 0);
			if (!total) return undefined;
			return loaded < total ? allPages.length : undefined;
		},
		refetchInterval: 20000,
		staleTime: 0
	});

	let myUserId = $state<string>('');
	let myAvatarOverrideKey = $state<string>('');

	const onAvatarEvent = (e: Event) => {
		const ce = e as CustomEvent;
		const key = normalizeToCloudfrontKey((ce?.detail ?? '').toString());
		if (key) myAvatarOverrideKey = key;
	};

	let scrollEl = $state<HTMLElement | null>(null);
	let contentEl = $state<HTMLDivElement | null>(null);
	let sentinelEl = $state<HTMLElement | null>(null);

	let bgSegments = $state<{ src: string; top: number; h: number }[]>([]);
	let bgHeight = $state(0);

	let io: IntersectionObserver | null = null;
	let roScroll: ResizeObserver | null = null;
	let roContent: ResizeObserver | null = null;

	const normalizedItems = $derived.by(() => {
		const pages = ($leaderboardQuery.data?.pages ?? []) as any[];
		const flat = pages.flatMap((p) => p?.entries ?? []) as UserLeaderboardEntryDto[];

		return flat.map((u, idx) => {
			const raw = (u as any)?.userAvatarUrl ?? '';
			const keyFromApi = normalizeToCloudfrontKey(String(raw));
			const avatarKey =
				myUserId && (u as any)?.userId === myUserId && myAvatarOverrideKey
					? myAvatarOverrideKey
					: keyFromApi || defaultAvatar;

			const rank = typeof (u as any)?.rank === 'number' ? (u as any).rank : idx + 1;
			const username = String((u as any)?.username ?? (u as any)?.userName ?? '');

			return { ...u, rank, username, avatarKey };
		});
	});

	const topUsers = $derived.by(() =>
		normalizedItems.slice(0, 3).map((u) => ({
			...u,
			avatarPath: u.avatarKey
		}))
	);

	const recomputeBackground = () => {
		const vh = scrollEl?.clientHeight ?? 0;
		const vw = scrollEl?.clientWidth ?? 0;
		const sh = scrollEl?.scrollHeight ?? 0;

		const viewportH = Math.max(1, vh);
		const viewportW = Math.max(1, vw);
		const scrollH = Math.max(viewportH, sh);

		const tileH = Math.max(viewportH, Math.round(viewportW * gifRatio));
		const needsScroll = scrollH > viewportH + 2;

		if (!needsScroll) {
			bgHeight = viewportH;
			bgSegments = [{ src: gif1, top: 0, h: tileH }];
			return;
		}

		bgHeight = scrollH;
		const count = Math.max(1, Math.ceil(scrollH / tileH));
		bgSegments = Array.from({ length: count }, (_, i) => ({
			src: i === 0 ? gif1 : i % 2 === 1 ? gif2 : gif3,
			top: i * tileH,
			h: tileH
		}));
	};

	$effect(() => {
		normalizedItems.length;
		recomputeBackground();
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

		if (sentinelEl) {
			io = new IntersectionObserver(
				(entries) => {
					if (!entries?.[0]?.isIntersecting) return;
					const v: any = $leaderboardQuery;
					if (v?.hasNextPage && !v?.isFetchingNextPage) {
						(leaderboardQuery as any).fetchNextPage?.();
					}
				},
				{ root: scrollEl, rootMargin: '600px 0px 600px 0px', threshold: 0 }
			);
			io.observe(sentinelEl);
		}

		recomputeBackground();
	});

	onDestroy(() => {
		if (io) io.disconnect();
		io = null;

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
	<div class="absolute top-0 left-0 z-0 w-full overflow-hidden" style={`height:${bgHeight}px;`}>
		<div class="relative w-full" style={`height:${bgHeight}px;`}>
			{#each bgSegments as seg (seg.top)}
				<img
					src={seg.src}
					alt=""
					aria-hidden="true"
					class="pointer-events-none absolute left-0 w-full object-cover select-none"
					style={`top:${seg.top}px;height:${seg.h}px;`}
				/>
			{/each}
		</div>
	</div>

	<div
		bind:this={contentEl}
		class="relative z-10 flex flex-col items-center gap-6 pt-12 pr-8 pb-8 pl-8"
	>
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-[14rem] ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Leaderboard
		</h1>

		<PixelFrameSimple
			className="relative mb-10 flex h-max w-full max-w-2xl flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-2 pb-6 text-[color:var(--color-landingpage-subtitle)]"
		>
			<div>
				<img
					class="pointer-events-none absolute -top-[9.9rem] left-[10rem] z-500 h-[8rem] object-cover select-none"
					src="/leaderboard/Global_Podium.png"
					alt="Global Podium"
				/>
				<div class="absolute -top-[15rem] right-[5rem] z-10 -translate-x-50">
					{#if topUsers[0]}
						<CloudfrontImage
							path={topUsers[0].avatarPath}
							cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2"
						/>
					{/if}
				</div>
				<div class="absolute -top-[11.9rem] right-[11.2rem] z-10 -translate-x-50">
					{#if topUsers[1]}
						<CloudfrontImage
							path={topUsers[1].avatarPath}
							cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2"
						/>
					{/if}
				</div>
				<div class="absolute -top-[11.2rem] -right-[2.2rem] z-10 -translate-x-53">
					{#if topUsers[2]}
						<CloudfrontImage
							path={topUsers[2].avatarPath}
							cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2"
						/>
					{/if}
				</div>
			</div>

			{#each normalizedItems as user, i ((user as any).userId ?? user.rank ?? i)}
				<div
					class={`mx-auto mb-1 flex w-full max-w-[40rem] items-center justify-between rounded py-2 pr-8 ${i === normalizedItems.length - 1 ? 'mb-2' : ''}`}
				>
					<div class="flex items-center gap-3">
						<span class="min-w-[3.5rem] text-right">{user.rank}.</span>

						<div
							class="h-12 w-12 shrink-0 overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
							role="button"
							tabindex="0"
							aria-label="View profile"
							onclick={() => goProfile((user as any).userId)}
							onkeydown={(e) => onProfileKey(e, (user as any).userId)}
						>
							<CloudfrontImage
								path={user.avatarKey}
								cls="h-full w-full -translate-x-[-10%] -translate-y-[0%] scale-[1.5] object-cover object-[left_top]"
							/>
						</div>

						<span
							class="text scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[20rem] cursor-pointer overflow-x-auto whitespace-nowrap hover:underline"
							role="button"
							tabindex="0"
							aria-label="View profile"
							onclick={() => goProfile((user as any).userId)}
							onkeydown={(e) => onProfileKey(e, (user as any).userId)}
						>
							{user.username}
						</span>
					</div>

					<PixelFrameMini
						className="flex items-center gap-1 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>{pointsOf(user)}</span>
						<img
							src={starSrc}
							alt="points"
							class="ml-1 inline-block h-[1.1rem] w-[1.1rem] shrink-0 align-[-0.2em]"
						/>
					</PixelFrameMini>
				</div>
			{/each}

			<div bind:this={sentinelEl} class="h-12 w-full"></div>

			{#if ($leaderboardQuery as any).isFetchingNextPage}
				<div class="mx-auto mb-2 w-full max-w-[40rem] px-8 py-3 text-center text-sm opacity-80">
					Loading more...
				</div>
			{/if}
		</PixelFrameSimple>
	</div>
</section>
