<script lang="ts">
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';

	import gold from '$lib/images/leaderboard/Gold.png';
	import silver from '$lib/images/leaderboard/Silver.png';
	import bronze from '$lib/images/leaderboard/Bronze.png';
	import trophy from '$lib/images/leaderboard/trophy.png';
	import CloudfrontImage from '$lib/Components/CloudfrontImage.svelte';

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
	class="font-body relative mt-[-1rem] mr-5 mb-0 ml-12 flex max-h-[calc(100vh-6.4rem)] w-[62vw] flex-col items-center gap-6 overflow-y-auto px-5 pr-2 pl-2"
>
	<section class="relative w-full">
		<div
			class="relative mb-10 flex h-max w-full max-w-full flex-col pt-8 text-[color:var(--color-text)]"
		>
			<div class="mx-auto flex w-full max-w-[38rem] items-center justify-between rounded px-0 py-2">
				<div
					class="mx-auto -mt-6 mb-8 flex w-full max-w-xl flex-col items-center rounded-[18px] border-[color:var(--color-accent-1)] px-4 pt-8 pb-12"
				>
					<div class="mt-8 mb-12 flex items-end justify-center gap-8">
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
					<PixelFrame
						className="flex h-max w-full max-w-xl flex-col bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-8 pr-2 pb-6 text-[color:var(--color-text)]"
					>
						{#each sortedUsers as user, i}
							<div
								class={`mx-auto mb-1 flex w-full max-w-[32rem] items-center justify-between rounded py-2 pr-8 ${i === sortedUsers.length - 1 ? 'mb-10' : ''}`}
							>
								<div class="flex items-center gap-3">
									<span class="min-w-[3.5rem] text-right">
										{i + 1}.
									</span>

									<div
										class="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-[color:var(--color-primary)] shadow"
									>
										<CloudfrontImage
											path={`Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`}
											cls="h-full w-full -translate-x-[-15%] -translate-y-[-10%] scale-[1.5] object-cover object-[left_top]"
										/>
									</div>

									<span
										class="text scrollbar-thin hover:scrollbar-thumb-gray-400 max-w-[10rem] overflow-x-auto whitespace-nowrap"
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
				</div>
			</div>
		</div>
	</section>
</div>
