<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { cohortApi } from '$lib/api/cohort';
	import type { UserAchievementDto, UserDto, UserStatisticsDto } from '$lib/api/user';

	import Header from './_parts/header.svelte';
	import Cohort from './_parts/cohort.svelte';
	import Stats from './_parts/stats.svelte';
	import Achievements from './_parts/achievements.svelte';
	import {
		achievementDesc,
		achievementName,
		getCohortId,
		loadProfile,
		pickAvatarPath
	} from './profile';

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

	let cohortDetails = $state<any | null>(null);
	let cohortLoading = $state<boolean>(false);
	let joiningCohort = $state<boolean>(false);
	let cohortError = $state<string>('');

	let copied = $state<boolean>(false);

	let globalRank = $state<number | null>(null);

	const titleText = $derived(isMe ? 'My Profile' : '');

	const displayName = $derived((user?.username ?? '').trim() || 'User');
	const isLongName = $derived(displayName.length > 18);

	const headTitle = $derived(isMe ? titleText : displayName);

	const avatarPath = $derived.by(() => pickAvatarPath(user, stats, avatarOverride, defaultAvatar));

	const xp = $derived(user?.experience ?? stats?.experience ?? 0);
	const solved = $derived(user?.amountSolved ?? stats?.amountSolved ?? 0);
	const coins = $derived(user?.coins ?? stats?.coins ?? 0);

	const acceptance = $derived(stats?.acceptanceRate);
	const totalSubs = $derived(stats?.totalSubmissions);

	const cohortId = $derived.by(() => getCohortId(user, stats));
	const cohortJoinCode = $derived.by(() => (cohortDetails?.joinCode ?? '').toString().trim());

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
			cohortError = e instanceof Error ? e.message : 'Failed to join cohort.';
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
			cohortError = e instanceof Error ? e.message : 'Failed to switch cohorts.';
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
		cohortLoading = true;
		try {
			const loaded = await loadProfile(userIdParam, defaultAvatar, fetch);
			user = loaded.user;
			stats = loaded.stats;
			achievements = loaded.achievements;
			avatarOverride = loaded.avatarOverride;
			resolvedUserId = loaded.resolvedUserId;
			isMe = loaded.isMe;
			myCohortId = loaded.myCohortId;
			cohortDetails = loaded.cohortDetails;
			cohortError = loaded.cohortError;
			globalRank = loaded.globalRank;
		} finally {
			cohortLoading = false;
		}
	});
</script>

<svelte:head>
	<title>{headTitle} - AlgoDuck</title>
</svelte:head>

<section
	class="font-body flex max-h-[calc(100vh-5rem)] flex-col items-center gap-6 overflow-y-auto pt-12 pr-8 pb-0 pl-8"
>
	<h1
		class="ocr-outline ocr-title isolate mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)] {isMe
			? ''
			: '-mt-[5rem]'}"
	>
		{titleText}
	</h1>

	<PixelFrameSimple
		className="mb-10 flex h-max w-full max-w-4xl flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-6 pb-8 pl-6 text-[color:var(--color-landingpage-subtitle)]"
	>
		<Header {avatarPath} {displayName} {isLongName} {xp} {coins} {globalRank} {starSrc} {coinSrc} />

		<Cohort
			{cohortId}
			{cohortLoading}
			{cohortJoinCode}
			{copied}
			{isMe}
			{cohortDetails}
			{joiningCohort}
			{myCohortId}
			{cohortError}
			onCopy={copyJoinCode}
			onJoin={joinTheirCohort}
			onSwitch={leaveCurrentAndJoinTheirCohort}
		/>

		<Stats {solved} {acceptance} {totalSubs} />

		<Achievements {achievements} nameOf={achievementName} descOf={achievementDesc} />
	</PixelFrameSimple>
</section>
