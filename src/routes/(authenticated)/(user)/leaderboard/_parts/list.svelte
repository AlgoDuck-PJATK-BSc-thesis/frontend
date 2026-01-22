<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { LeaderboardItem, TopUser } from '../types';
	import Podium from './podium.svelte';

	let {
		items,
		topUsers,
		starSrc,
		loadingMore,
		onProfile,
		onProfileKey,
		sentinel = $bindable(null)
	} = $props<{
		items: LeaderboardItem[];
		topUsers: TopUser[];
		starSrc: string;
		loadingMore: boolean;
		onProfile: (userId: string) => void;
		onProfileKey: (e: KeyboardEvent, userId: string) => void;
		sentinel?: HTMLElement | null;
	}>();
</script>

<PixelFrameSimple
	className="relative mb-10 flex h-max w-full max-w-2xl flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-2 pb-6 text-[color:var(--color-landingpage-subtitle)]"
>
	<Podium {topUsers} />

	{#each items as user, i ((user as any).userId ?? user.rank ?? i)}
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
					onclick={() => onProfile(((user as any).userId ?? '').toString())}
					onkeydown={(e) => onProfileKey(e, ((user as any).userId ?? '').toString())}
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
					onclick={() => onProfile(((user as any).userId ?? '').toString())}
					onkeydown={(e) => onProfileKey(e, ((user as any).userId ?? '').toString())}
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

	{#if loadingMore}
		<div class="mx-auto mb-2 w-full max-w-[40rem] px-8 py-3 text-center text-sm opacity-80">
			Loading more...
		</div>
	{/if}
</PixelFrameSimple>
