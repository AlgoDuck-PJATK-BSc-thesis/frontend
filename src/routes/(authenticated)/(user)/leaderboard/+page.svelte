<script lang="ts">
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import type { DuckDto } from '../../Shop/Dtos';

	import gold from '$lib/images/leaderboard/Gold.png';
	import silver from '$lib/images/leaderboard/Silver.png';
	import bronze from '$lib/images/leaderboard/Bronze.png';
	import trophy from '$lib/images/leaderboard/trophy.png';

	const medals = [gold, silver, bronze];

	const allUsers = [
		{ name: 'QuantumQuokka', points: 300 },
		{ name: 'StarrySpectre', points: 200 },
		{ name: 'FrostedFalcon', points: 150 },
		{ name: 'EchoOrbit', points: 100 },
		{ name: 'PixelPenguin', points: 90 },
		{ name: 'NovaNebula', points: 80 },
		{ name: 'CrimsonCoyote', points: 70 },
		{ name: 'BlueBird', points: 60 },
		{ name: 'NewNoise', points: 50 },
		{ name: 'HarshHistory', points: 40 },
		{ name: 'TurboTurtle', points: 30 },
		{ name: 'SilentShadow', points: 20 },
		{ name: 'SlySpeed', points: 10 },
		{ name: 'MadMercury', points: 5 },
		{ name: 'TurboTurbine', points: 0 }
	];

	$: sortedUsers = [...allUsers].sort((a, b) => b.points - a.points);

	$: topUsers = sortedUsers.slice(0, 3).map((user, i) => ({
		...user,
		medal: medals[i]
	}));

	$: from = 1;
	$: to = sortedUsers.length;
</script>

<svelte:head>
	<title>Leaderboard - AlgoDuck</title>
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
		<img
			class="pointer-events-none absolute -top-[9.9rem] left-[10rem] z-500 h-[8rem] object-cover select-none"
			src="/leaderboard/Podium.png"
			alt="Podium"
		/>
		<div class="absolute -top-[15.1rem] right-[4.5rem] z-10 -translate-x-50">
			<CloudfrontImage
				path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
				cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2 "
			/>
		</div>
		<div class="absolute -top-[12.1rem] right-[11rem] z-10 -translate-x-50">
			<CloudfrontImage
				path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
				cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2 "
			/>
		</div>
		<div class="absolute -top-[11.5rem] -right-[2rem] z-10 -translate-x-50">
			<CloudfrontImage
				path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
				cls="h-[7rem] w-[7.2rem] drop-shadow-md -ml-2 "
			/>
		</div>
		{#each sortedUsers as user, i}
			<div
				class={`mx-auto mb-1 flex w-full max-w-[40rem] items-center justify-between rounded py-2 pr-8 ${i === sortedUsers.length - 1 ? 'mb-2' : ''}`}
			>
				<div class="flex items-center gap-3">
					<span class="min-w-[3.5rem] text-right">
						{i + 1}.
					</span>

					<div
						class="h-12 w-12 shrink-0 overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
					>
						<CloudfrontImage
							path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
							cls="h-full w-full -translate-x-[-10%] -translate-y-[-10%] scale-[1.5] object-cover object-[left_top]"
						/>
					</div>

					<span
						class="text scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[10rem] overflow-x-auto whitespace-nowrap"
					>
						{user.name}
					</span>
				</div>

				<PixelFrameMini
					className="flex items-center gap-1 bg-[color:var(--color-header-user)] px-3 py-0.5 text-[1rem] text-[color:var(--color-landingpage-subtitle)]"
				>
					<span>{user.points}</span>
					<span>⭐</span>
				</PixelFrameMini>
			</div>
		{/each}
	</PixelFrameSimple>
</section>
