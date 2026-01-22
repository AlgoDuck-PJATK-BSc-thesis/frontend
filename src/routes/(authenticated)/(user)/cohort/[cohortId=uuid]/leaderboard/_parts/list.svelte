<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { LeaderboardItemDto } from '$lib/api/cohort';

	let { users, starSrc, defaultAvatar, onProfile, onProfileKey } = $props<{
		users: LeaderboardItemDto[];
		starSrc: string;
		defaultAvatar: string;
		onProfile: (userId: string) => void;
		onProfileKey: (e: KeyboardEvent, userId: string) => void;
	}>();

	const pointsOf = (u: LeaderboardItemDto) => u.experience;
</script>

{#each users as user, i}
	<div
		class={`mx-auto mb-1 flex w-full max-w-[40rem] items-center justify-between rounded py-2 pr-8 ${i === users.length - 1 ? 'mb-2' : ''}`}
	>
		<div class="flex items-center gap-3">
			<span class="min-w-[3.5rem] text-right">{i + 1}.</span>

			<div
				class="h-12 w-12 shrink-0 overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
				role="button"
				tabindex="0"
				aria-label="View profile"
				onclick={() => onProfile(user.userId)}
				onkeydown={(e) => onProfileKey(e, user.userId)}
			>
				<CloudfrontImage
					path={user.userAvatarUrl ? user.userAvatarUrl : defaultAvatar}
					cls="h-full w-full -translate-x-[-10%] -translate-y-[0%] scale-[1.5] object-cover object-[left_top]"
				/>
			</div>

			<span
				class="text scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[20rem] cursor-pointer overflow-x-auto whitespace-nowrap hover:underline"
				role="button"
				tabindex="0"
				aria-label="View profile"
				onclick={() => onProfile(user.userId)}
				onkeydown={(e) => onProfileKey(e, user.userId)}
			>
				{user.userName}
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
