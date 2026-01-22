<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { UiUser } from '../presence';

	let { users } = $props<{ users: UiUser[] }>();
</script>

<PixelFrameSimple
	className="h-[64vh] min-w-[20rem] ml-[3rem] mt-[12rem] w-[25vw] flex flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<h1
		class="ocr-outline ocr-title mt-1 flex max-w-[20rem] justify-center overflow-x-auto p-4 [font-family:var(--font-ariw9500)] text-4xl leading-[1.5] font-bold tracking-widest whitespace-nowrap text-[var(--color-landingpage-title)]"
	>
		Activity
	</h1>

	<div class="mt-2 ml-[0rem] h-[58vh] w-full flex-1 overflow-auto px-4">
		{#each users as user}
			<div class="mb-2 ml-4 flex w-[80%] items-center gap-3">
				<div class="relative h-12 w-12 shrink-0">
					<div
						class="h-full w-full overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
					>
						<CloudfrontImage
							path={user.avatarPath}
							cls="h-full w-full -translate-x-[-15%] -translate-y-[0%] scale-[1.5] object-cover object-[left_top]"
						/>
					</div>

					<span
						title={user.badgeTitle}
						class={`absolute right-0 bottom-0 h-4 w-4 rounded-full border-[2px] border-[color:var(--color-white)] ${
							user.status === 'active'
								? 'bg-green-400'
								: user.status === 'away'
									? 'bg-yellow-500'
									: 'bg-gray-500'
						} ${
							user.status === 'away' && user.badgeText
								? 'flex items-center justify-center px-3 py-2 text-[0.55rem] leading-none font-semibold text-white'
								: ''
						}`}
					>
						{#if user.status === 'away' && user.badgeText}
							{user.badgeText}
						{/if}
					</span>
				</div>

				<PixelFrameSimple
					className="flex-1 rounded-2xl bg-[color:var(--color-landingpage-subtitle)] px-4 py-3 text-sm text-[color:var(--color-shadow-black)]"
				>
					<span class="font-semibold">{user.name}</span>
				</PixelFrameSimple>
			</div>
		{/each}
	</div>
</PixelFrameSimple>
