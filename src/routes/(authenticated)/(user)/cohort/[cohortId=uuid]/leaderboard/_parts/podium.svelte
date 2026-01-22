<script lang="ts">
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { LeaderboardItemDto } from '$lib/api/cohort';

	let { topUsers } = $props<{ topUsers: { user: LeaderboardItemDto; avatarPath: string }[] }>();
</script>

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
