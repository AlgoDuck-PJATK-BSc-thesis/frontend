<script lang="ts">
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { TopUser } from '../types';

	let { topUsers } = $props<{ topUsers: TopUser[] }>();
</script>

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
