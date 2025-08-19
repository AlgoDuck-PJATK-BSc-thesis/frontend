<script lang="ts">
	import PixelFrame from '../../../Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import PixelFrameMini from '../../../Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';

	import gold from '$lib/images/leaderboard/Gold.png';
	import silver from '$lib/images/leaderboard/Silver.png';
	import bronze from '$lib/images/leaderboard/Bronze.png';
	import trophy from '$lib/images/leaderboard/trophy.png';
	import PixelFrameSimple from '../../../Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	import duck from '$lib/images/ducks/duck.png';

	const medals = [gold, silver, bronze];

	const allUsers = [
		{ name: 'FrostedFalcon', points: 15000 },
		{ name: 'EchoOrbit', points: 100 },
		{ name: 'PixelPenguin', points: 9000 },
		{ name: 'NovaNebula', points: 80 },
		{ name: 'CrimsonCoyote', points: 7000 },
		{ name: 'BlueBird', points: 4000 },
		{ name: 'HarshHistory', points: 40 },
		{ name: 'TurboTurtle', points: 30 },
		{ name: 'SilentShadow', points: 20 },
		{ name: 'SlySpeed', points: 10 }
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
	<title>Leaderboard – Beetcode</title>
</svelte:head>

<div
	class="font-body relative mt-16 mr-5 mb-0 ml-12 flex max-h-[calc(100vh-12rem)] w-[68vw] flex-col items-center gap-6 overflow-y-auto px-5 pr-2 pl-2"
>
	<section class="relative w-full">
		<img
			src={duck}
			alt="Duck"
			class="pointer-events-none fixed top-[7.2rem] right-[calc(30vw+1rem)] z-[19] h-20 w-20 select-none"
		/>

		<PixelFrame
			className="mb-10 relative flex flex-col h-max w-full max-w-full bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 text-[color:var(--color-text)]"
		>
			<div class="mx-auto flex w-full max-w-[38rem] items-center justify-between rounded px-4 py-2">
				<PixelFrameSimple
					className="mx-auto mb-4 mt-2 rounded-[18px] border-[color:var(--color-accent-1)] flex bg-[linear-gradient(to_bottom,var(--color-accent-1),var(--color-accent-4))] w-full max-w-lg flex-col items-center px-2 pt-4 pb-8"
				>
					<div class="mt-8 flex items-end justify-center gap-8">
						<div class="relative flex translate-y-4 flex-col items-center">
							<div
								class="absolute -top-6 rounded-full bg-[color:var(--color-text)] px-2 py-0.5 text-xs font-bold text-[color:var(--color-bg)]"
							>
								2
							</div>
							<img src={trophy} alt="Silver Trophy" class="mb-2 h-20 w-20" />
							<div class=" text-lg font-bold text-[color:var(--color-accent-2)]">
								{topUsers[1].name}
							</div>
						</div>

						<div class="relative flex -translate-y-2 flex-col items-center">
							<div
								class="absolute -top-6 rounded-full bg-[color:var(--color-text)] px-2 py-0.5 text-xs font-bold text-[color:var(--color-bg)]"
							>
								1
							</div>
							<img src={trophy} alt="Gold Trophy" class="mb-2 h-24 w-24" />
							<div class="text-xl font-bold text-[color:var(--color-accent-2)]">
								{topUsers[0].name}
							</div>
						</div>

						<div class="relative flex translate-y-4 flex-col items-center">
							<div
								class="absolute -top-6 rounded-full bg-[color:var(--color-text)] px-2 py-0.5 text-xs font-bold text-[color:var(--color-bg)]"
							>
								3
							</div>
							<img src={trophy} alt="Bronze Trophy" class="mb-2 h-20 w-20" />
							<div class=" text-lg font-bold text-[color:var(--color-accent-2)]">
								{topUsers[2].name}
							</div>
						</div>
					</div>
				</PixelFrameSimple>
			</div>

			{#each sortedUsers as user, i}
				<div
					class={`mx-auto mb-1 flex w-full max-w-[30rem] items-center justify-between rounded py-2 pr-8 ${i === sortedUsers.length - 1 ? 'pb-2' : ''}`}
				>
					<div class="flex items-center gap-2">
						<span class="min-w-[3.5rem] text-right">
							{i + 1}.
						</span>
						<span
							class="text scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[14rem] overflow-x-auto whitespace-nowrap"
						>
							{user.name}
						</span>
					</div>

					<PixelFrameMini
						className="flex items-center gap-1 bg-[color:var(--color-bg)] px-3 py-0.5 text-[0.9rem] text-[color:var(--color-text)]"
					>
						<span>{user.points}</span>
						<span>⭐</span>
					</PixelFrameMini>
				</div>
			{/each}
		</PixelFrame>
	</section>
</div>
