<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy, onMount } from 'svelte';
	import { cohortApi, type LeaderboardItemDto } from '$lib/api/cohort';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	import Podium from './_parts/podium.svelte';
	import List from './_parts/list.svelte';

	const cohortId = $derived(page.params.cohortId ?? '');
	const starSrc = '/headers/star.png';
	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;

	let items = $state<LeaderboardItemDto[]>([]);
	let refreshHandle = $state<number | null>(null);

	const pointsOf = (u: LeaderboardItemDto) => u.experience;

	const sortedUsers = $derived.by(() =>
		[...items].sort((a: LeaderboardItemDto, b: LeaderboardItemDto) => pointsOf(b) - pointsOf(a))
	);

	const topUsers = $derived.by(() =>
		sortedUsers.slice(0, 3).map((user: LeaderboardItemDto) => ({
			user,
			avatarPath: user.userAvatarUrl ? user.userAvatarUrl : defaultAvatar
		}))
	);

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

	const refresh = async () => {
		if (!cohortId) return;
		try {
			items = await cohortApi.getLeaderboard(cohortId);
		} catch {}
	};

	onMount(async () => {
		await refresh();
		refreshHandle = window.setInterval(refresh, 20000);
	});

	onDestroy(() => {
		if (refreshHandle) window.clearInterval(refreshHandle);
		refreshHandle = null;
	});
</script>

<section
	class="font-body flex max-h-[calc(100vh-4rem)] flex-col items-center gap-6 overflow-y-auto pt-12 pr-8 pb-0 pl-8"
>
	<h1
		class="ocr-outline ocr-title isolate mt-0 mb-[14rem] ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
	>
		Leaderboard
	</h1>

	<PixelFrameSimple
		className="mb-10 flex h-max w-full max-w-2xl flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-2 pb-6 text-[color:var(--color-landingpage-subtitle)]"
	>
		<Podium {topUsers} />
		<List users={sortedUsers} {starSrc} {defaultAvatar} onProfile={goProfile} {onProfileKey} />
	</PixelFrameSimple>
</section>
