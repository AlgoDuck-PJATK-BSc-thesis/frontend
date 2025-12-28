<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

	import { onDestroy, onMount } from 'svelte';
	import { userApi, type UserLeaderboardEntryDto } from '$lib/api/user';
	import { goto } from '$app/navigation';

	const starSrc = '/headers/star.png';

	let items = $state<UserLeaderboardEntryDto[]>([]);
	let refreshHandle = $state<number | null>(null);

	const defaultAvatar = `Ducks/Outfits/duck-052b219a-ec0b-430a-a7db-95c5db35dfce.png`;

	const pointsOf = (u: UserLeaderboardEntryDto) => u.experience;

	const topUsers = $derived.by(() =>
		items.slice(0, 3).map((user: UserLeaderboardEntryDto, i: number) => ({
			...user,
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
		try {
			items = await userApi.getGlobalLeaderboardAll();
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

<svelte:head>
	<title>Global Leaderboard - AlgoDuck</title>
</svelte:head>

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
		<div>
			<img
				class="pointer-events-none absolute -top-[9.9rem] left-[10rem] z-500 h-[8rem] object-cover select-none"
				src="/leaderboard/Podium.png"
				alt="Podium"
			/>
			<div class="absolute -top-[15.1rem] right-[4.5rem] z-10 -translate-x-50">
				{#if topUsers[0]}
					<CloudfrontImage
						path={topUsers[0].avatarPath}
						cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2 "
					/>
				{/if}
			</div>
			<div class="absolute -top-[12.1rem] right-[11rem] z-10 -translate-x-50">
				{#if topUsers[1]}
					<CloudfrontImage
						path={topUsers[1].avatarPath}
						cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2 "
					/>
				{/if}
			</div>
			<div class="absolute -top-[11.5rem] -right-[2rem] z-10 -translate-x-50">
				{#if topUsers[2]}
					<CloudfrontImage
						path={topUsers[2].avatarPath}
						cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2 "
					/>
				{/if}
			</div>
		</div>

		{#each items as user, i}
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
						onclick={() => goProfile(user.userId)}
						onkeydown={(e) => onProfileKey(e, user.userId)}
					>
						<CloudfrontImage
							path={user.userAvatarUrl ? user.userAvatarUrl : defaultAvatar}
							cls="h-full w-full -translate-x-[-10%] -translate-y-[-10%] scale-[1.5] object-cover object-[left_top]"
						/>
					</div>

					<span
						class="text scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[20rem] cursor-pointer overflow-x-auto whitespace-nowrap hover:underline"
						role="button"
						tabindex="0"
						aria-label="View profile"
						onclick={() => goProfile(user.userId)}
						onkeydown={(e) => onProfileKey(e, user.userId)}
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
	</PixelFrameSimple>
</section>
