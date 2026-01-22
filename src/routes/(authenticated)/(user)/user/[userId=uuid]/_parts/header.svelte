<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

	let { avatarPath, displayName, isLongName, xp, coins, starSrc, coinSrc } = $props<{
		avatarPath: string;
		displayName: string;
		isLongName: boolean;
		xp: number;
		coins: number;
		starSrc: string;
		coinSrc: string;
	}>();
</script>

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
			class={`text-3xl font-bold tracking-wide ${
				isLongName
					? 'scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[40rem] overflow-x-auto py-1 whitespace-nowrap'
					: ''
			}`}
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
