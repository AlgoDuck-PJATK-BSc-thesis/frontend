<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import {
		userApi,
		type UserAchievementDto,
		type UserDto,
		type UserStatisticsDto,
		type UserLeaderboardEntryDto
	} from '$lib/api/user';
	import { authApi } from '$lib/api/auth';
	import { cohortApi, type CohortDetailsDto } from '$lib/api/cohort';

	const userIdParam = $derived(page.params.userId ?? '');

	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;

	const coinSrc = '/headers/coin.png';
	const starSrc = '/headers/star.png';

	let user = $state<UserDto | null>(null);
	let stats = $state<UserStatisticsDto | null>(null);
	let achievements = $state<UserAchievementDto[]>([]);
	let avatarOverride = $state<string>('');

	let resolvedUserId = $state<string>('');
	let isMe = $state<boolean>(false);

	let myCohortId = $state<string>('');

	let cohortDetails = $state<CohortDetailsDto | null>(null);
	let cohortLoading = $state<boolean>(false);
	let joiningCohort = $state<boolean>(false);
	let cohortError = $state<string>('');

	let copied = $state<boolean>(false);

	const titleText = $derived(isMe ? 'My Profile' : 'Profile');

	const displayName = $derived((user?.username ?? '').trim() || 'User');
	const isLongName = $derived(displayName.length > 18);

	const avatarPath = $derived.by(() => {
		const override = avatarOverride.trim();
		if (override) return override;

		const u = user as unknown as Record<string, unknown> | null;
		const s = stats as unknown as Record<string, unknown> | null;

		const candidates: string[] = [
			typeof u?.userAvatarUrl === 'string' ? (u.userAvatarUrl as string) : '',
			typeof (u as any)?.avatarUrl === 'string' ? ((u as any).avatarUrl as string) : '',
			typeof (u as any)?.selectedAvatarUrl === 'string'
				? ((u as any).selectedAvatarUrl as string)
				: '',
			typeof (u as any)?.selectedDuckUrl === 'string' ? ((u as any).selectedDuckUrl as string) : '',
			typeof (u as any)?.selectedDuckPath === 'string'
				? ((u as any).selectedDuckPath as string)
				: '',
			typeof s?.userAvatarUrl === 'string' ? (s.userAvatarUrl as string) : '',
			typeof (s as any)?.avatarUrl === 'string' ? ((s as any).avatarUrl as string) : '',
			typeof (s as any)?.selectedAvatarUrl === 'string'
				? ((s as any).selectedAvatarUrl as string)
				: '',
			typeof (s as any)?.selectedDuckUrl === 'string' ? ((s as any).selectedDuckUrl as string) : '',
			typeof (s as any)?.selectedDuckPath === 'string'
				? ((s as any).selectedDuckPath as string)
				: ''
		];

		const picked = candidates.map((x) => x.trim()).find((x) => x.length > 0);
		return picked ?? defaultAvatar;
	});

	const xp = $derived(user?.experience ?? stats?.experience ?? 0);
	const solved = $derived(user?.amountSolved ?? stats?.amountSolved ?? 0);
	const coins = $derived(user?.coins ?? stats?.coins ?? 0);

	const acceptance = $derived(stats?.acceptanceRate);
	const totalSubs = $derived(stats?.totalSubmissions);
	const accepted = $derived(stats?.accepted);
	const wa = $derived(stats?.wrongAnswer);
	const tle = $derived(stats?.timeLimitExceeded);
	const re = $derived(stats?.runtimeError);

	const cohortId = $derived.by(() => {
		const s = stats as any;
		const u = user as any;
		const id = (s?.cohortId ?? u?.cohortId ?? '').toString().trim();
		return id;
	});

	const cohortJoinCode = $derived.by(() => (cohortDetails?.joinCode ?? '').toString().trim());

	const achievementName = (a: UserAchievementDto) =>
		(a.name ?? (a as any).title ?? '').toString().trim() || 'Achievement';

	const achievementDesc = (a: UserAchievementDto) => (a.description ?? '').toString().trim();

	const tryResolveAvatarFromLeaderboard = async () => {
		if (!resolvedUserId) return;
		try {
			const all = await userApi.getGlobalLeaderboardAll(fetch);
			const hit = all.find((x: UserLeaderboardEntryDto) => x.userId === resolvedUserId);
			const url = (hit?.userAvatarUrl ?? '').toString().trim();
			if (url) avatarOverride = url;
		} catch {}
	};

	const loadCohortDetails = async (id: string) => {
		const clean = (id ?? '').toString().trim();
		cohortError = '';
		cohortDetails = null;

		if (!clean) return;

		cohortLoading = true;
		try {
			cohortDetails = await cohortApi.getById(clean, fetch);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to load cohort.';
			cohortError = msg;
			cohortDetails = null;
		} finally {
			cohortLoading = false;
		}
	};

	const navigateToCohortChat = async (id: string) => {
		await goto(`/cohort/${encodeURIComponent(id)}/chat`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true,
			invalidateAll: false
		});
	};

	const joinTheirCohort = async () => {
		const id = (cohortDetails?.cohortId ?? cohortId ?? '').toString().trim();
		if (!id) return;

		cohortError = '';
		joiningCohort = true;
		try {
			await cohortApi.joinById(id, fetch);
			await navigateToCohortChat(id);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to join cohort.';
			cohortError = msg;
		} finally {
			joiningCohort = false;
		}
	};

	const leaveCurrentAndJoinTheirCohort = async () => {
		const targetId = (cohortDetails?.cohortId ?? cohortId ?? '').toString().trim();
		if (!targetId) return;

		if (!myCohortId.trim()) {
			await joinTheirCohort();
			return;
		}

		if (myCohortId.trim() === targetId) {
			await navigateToCohortChat(targetId);
			return;
		}

		const ok =
			typeof window !== 'undefined'
				? window.confirm('Leave your current cohort and join this one?')
				: false;
		if (!ok) return;

		cohortError = '';
		joiningCohort = true;
		try {
			await cohortApi.leave(fetch);
			myCohortId = '';
			await cohortApi.joinById(targetId, fetch);
			myCohortId = targetId;
			await navigateToCohortChat(targetId);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to switch cohorts.';
			cohortError = msg;
		} finally {
			joiningCohort = false;
		}
	};

	const copyJoinCode = async () => {
		const code = cohortJoinCode;
		if (!code) return;

		let didCopy = false;

		try {
			await navigator.clipboard.writeText(code);
			didCopy = true;
		} catch {}

		if (!didCopy) {
			try {
				if (typeof window !== 'undefined') {
					window.prompt('Copy this cohort code:', code);
					didCopy = true;
				}
			} catch {}
		}

		if (didCopy) {
			copied = true;
			window.setTimeout(() => {
				copied = false;
			}, 1200);
		}
	};

	onMount(async () => {
		let meId = '';
		try {
			const me = await authApi.me();
			meId = (me?.id ?? '').toString();
		} catch {}

		if (userIdParam === 'me') {
			isMe = true;
			resolvedUserId = meId;
		} else {
			resolvedUserId = userIdParam;
			isMe = !!meId && meId === userIdParam;
		}

		if (!resolvedUserId) return;

		let fetchedUser: UserDto | null = null;
		let fetchedStats: UserStatisticsDto | null = null;

		try {
			const [u, s, a] = await Promise.all([
				userApi.getUserById(resolvedUserId),
				userApi.getUserStatisticsById(resolvedUserId),
				userApi.getUserAchievementsById(resolvedUserId)
			]);

			fetchedUser = u;
			fetchedStats = s;

			user = u;
			stats = s;
			achievements = a ?? [];
		} catch {
			user = null;
			stats = null;
			achievements = [];
		}

		if (meId) {
			if (isMe) {
				const cid = ((fetchedStats as any)?.cohortId ?? (fetchedUser as any)?.cohortId ?? '')
					.toString()
					.trim();
				myCohortId = cid;
			} else {
				try {
					const myStats = await userApi.getUserStatisticsById(meId);
					myCohortId = ((myStats as any)?.cohortId ?? '').toString().trim();
				} catch {
					myCohortId = '';
				}
			}
		} else {
			myCohortId = '';
		}

		if (avatarPath.trim() === defaultAvatar) {
			await tryResolveAvatarFromLeaderboard();
		}

		try {
			const cid = ((fetchedStats as any)?.cohortId ?? (fetchedUser as any)?.cohortId ?? '')
				.toString()
				.trim();
			await loadCohortDetails(cid);
		} catch {}
	});
</script>

<svelte:head>
	<title>{titleText} - AlgoDuck</title>
</svelte:head>

<section
	class="font-body flex max-h-[calc(100vh-8rem)] flex-col items-center gap-6 overflow-y-auto pt-12 pr-8 pb-0 pl-8"
>
	<h1
		class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
	>
		{titleText}
	</h1>

	<PixelFrameSimple
		className="mb-10 flex h-max w-full max-w-4xl flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-6 pb-8 pl-6 text-[color:var(--color-landingpage-subtitle)]"
	>
		<div class="flex items-center gap-6">
			<div
				class="h-[6.6rem] w-[6.6rem] shrink-0 overflow-hidden rounded-full border-4 border-white bg-[color:var(--color-primary)] shadow"
			>
				<CloudfrontImage
					path={avatarPath}
					cls="h-full w-full -translate-x-[-0%] -translate-y-[2%] scale-[1.2] object-cover object-[left_top]"
				/>
			</div>

			<div class="flex flex-col gap-2">
				<div
					class={`text-3xl font-bold tracking-wide ${isLongName ? 'scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[40rem] overflow-x-auto py-1 whitespace-nowrap' : ''}`}
				>
					{displayName}
				</div>

				<div class="flex flex-wrap gap-2">
					<PixelFrameMini
						className="flex items-center gap-1 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>{xp}</span>
						<img
							src={starSrc}
							alt="points"
							class="ml-1 inline-block h-[1.1rem] w-[1.1rem] shrink-0 align-[-0.2em]"
						/>
					</PixelFrameMini>

					<PixelFrameMini
						className="flex items-center gap-1 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>{coins}</span>
						<img
							src={coinSrc}
							alt="coin"
							class="ml-1 inline-block h-[1.1rem] w-[1.1rem] shrink-0 align-[-0.2em]"
						/>
					</PixelFrameMini>
				</div>
			</div>
		</div>

		<div class="mt-8 flex flex-col gap-2">
			{#if !cohortId}
				<div class="text-[1rem] text-[color:var(--color-landingpage-subtitle)]">
					User is not in any cohort.
				</div>
			{:else}
				<div class="flex flex-wrap items-center gap-2">
					<div class="text-[1rem] text-[color:var(--color-landingpage-subtitle)]">Cohort:</div>

					{#if cohortLoading}
						<PixelFrameMini
							className="flex items-center gap-2 bg-[color:var(--color-primary)] px-3 py-0.5 text-[1rem] text-[color:var(--color-accent-4)]"
						>
							<span>Loading</span>
						</PixelFrameMini>
					{:else if cohortJoinCode}
						<button
							type="button"
							onclick={copyJoinCode}
							class="group"
							aria-label="Copy cohort code"
						>
							<PixelFrameMini
								className="flex items-center gap-2 bg-[color:var(--color-primary)] px-3 py-0.5 text-[1rem] text-[color:var(--color-accent-4)] transition group-hover:brightness-110"
							>
								<span>{copied ? 'Copied' : cohortJoinCode}</span>
							</PixelFrameMini>
						</button>
					{/if}

					{#if !isMe && cohortDetails}
						{#if cohortDetails.isMember}
							<PixelFrameMini
								className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
							>
								<span>In your cohort</span>
							</PixelFrameMini>
						{:else}
							<button
								type="button"
								onclick={myCohortId.trim() ? leaveCurrentAndJoinTheirCohort : joinTheirCohort}
								class={joiningCohort ? 'pointer-events-none opacity-60' : ''}
							>
								<PixelFrameMini
									className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
								>
									<span>
										{joiningCohort
											? 'Joining'
											: myCohortId.trim()
												? 'Leave current cohort to join'
												: 'Join'}
									</span>
								</PixelFrameMini>
							</button>
						{/if}
					{/if}
				</div>

				{#if cohortError}
					<div class="text-sm text-red-500">{cohortError}</div>
				{/if}
			{/if}
		</div>

		<div class="mt-6 flex w-full flex-col gap-3">
			<div class="text-xl font-black tracking-wide">Statistics</div>

			<div class="flex flex-wrap gap-2">
				<PixelFrameMini
					className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
				>
					<span>Solved</span>
					<span>{solved}</span>
				</PixelFrameMini>

				{#if typeof acceptance === 'number'}
					<PixelFrameMini
						className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>Acceptance</span>
						<span>{Math.round(acceptance * 100)}%</span>
					</PixelFrameMini>
				{/if}

				{#if typeof totalSubs === 'number'}
					<PixelFrameMini
						className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>Submissions</span>
						<span>{totalSubs}</span>
					</PixelFrameMini>
				{/if}

				{#if typeof accepted === 'number'}
					<PixelFrameMini
						className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>Accepted</span>
						<span>{accepted}</span>
					</PixelFrameMini>
				{/if}

				{#if typeof wa === 'number'}
					<PixelFrameMini
						className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>Wrong</span>
						<span>{wa}</span>
					</PixelFrameMini>
				{/if}

				{#if typeof tle === 'number'}
					<PixelFrameMini
						className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>TLE</span>
						<span>{tle}</span>
					</PixelFrameMini>
				{/if}

				{#if typeof re === 'number'}
					<PixelFrameMini
						className="flex items-center gap-2 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
					>
						<span>RE</span>
						<span>{re}</span>
					</PixelFrameMini>
				{/if}
			</div>
		</div>

		<div class="mt-6 flex w-full flex-col gap-3">
			<div class="text-xl font-black tracking-wide">Achievements</div>

			<div class="flex max-h-[16rem] flex-col gap-2 overflow-y-auto pr-2">
				{#if achievements.length === 0}
					<div class="text-[color:var(--color-landingpage-subtitle)] opacity-80">
						No achievements yet.
					</div>
				{:else}
					{#each achievements as a}
						<div class="flex flex-col rounded bg-white/10 px-3 py-2">
							<div class="font-black">{achievementName(a)}</div>
							{#if achievementDesc(a)}
								<div class="text-sm opacity-90">{achievementDesc(a)}</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</PixelFrameSimple>
</section>
