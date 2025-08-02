<script lang="ts">
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
	
	// let currentPage = 1;
	// const pageSize = 12;

	// $: totalPages = Math.ceil(sortedUsers.length / pageSize);
	// $: paginatedUsers = sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
	// $: from = (currentPage - 1) * pageSize + 1;
	// $: to = Math.min(currentPage * pageSize, sortedUsers.length);
</script>

<svelte:head>
	<title>Leaderboard – Beetcode</title>
</svelte:head>

<section class="pt-8  pl-8  pr-8 pb-0 flex flex-col items-center gap-6  font-body max-h-[calc(100vh-5rem)] overflow-y-auto">
	<h1 class="text-5xl font-bold mt-4 mb-2 text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);">Leaderboard</h1>
    <div class="border-2 bg-[color:var(--color-tile)] border-[color:var(--color-accent-1)] rounded-xl pt-8 pb-12 px-10 w-full max-w-2xl flex flex-col items-center">
        <div class="flex justify-center items-end gap-8 mt-8">
            <div class="flex flex-col items-center translate-y-4 relative">
                <div class="absolute -top-6 bg-[color:var(--color-text)] text-[color:var(--color-tile)] text-xs font-bold px-2 py-0.5 rounded-full">
                    2
                </div>
                <img src={trophy} alt="Silver Trophy" class="w-20 h-20 mb-2" />
                <div class="text-m  text-[color:var(--color-accent-2)]">{topUsers[1].name}</div>
            </div>

            <div class="flex flex-col items-center -translate-y-2 relative">
                <div class="absolute -top-6 bg-[color:var(--color-text)] text-[color:var(--color-tile)] text-xs font-bold px-2 py-0.5 rounded-full">
                    1
                </div>
                <img src={trophy} alt="Gold Trophy" class="w-24 h-24 mb-2" />
                <div class="text-lg  text-[color:var(--color-accent-2)]">{topUsers[0].name}</div>
            </div>

            <div class="flex flex-col items-center translate-y-4 relative">
                <div class="absolute -top-6 bg-[color:var(--color-text)] text-[color:var(--color-tile)] text-xs font-bold px-2 py-0.5 rounded-full">
                    3
                </div>
                <img src={trophy} alt="Bronze Trophy" class="w-20 h-20 mb-2" />
                <div class="text-m  text-[color:var(--color-accent-2)]">{topUsers[2].name}</div>
            </div>
        </div>
    </div>

	<div class="w-full h-max max-w-2xl flex flex-col text-[color:var(--color-text)] overflow-auto">
		{#each sortedUsers as user, i}
			<div class="flex items-center justify-between px-4 py-2 rounded">
				<div class="flex items-center gap-2">
					<span class="min-w-[3.5rem] text-right">{i + 1}.</span>
					<span class="text-sm max-w-[20rem] overflow-x-auto whitespace-nowrap scrollbar-thin hover:scrollbar-thumb-gray-400">
						{user.name}
					</span>
				</div>

				<div class="flex items-center gap-1 border-2 rounded-full px-3 py-0.5 text-sm bg-[color:var(--color-tile)] border-[color:var(--color-accent-1)] text-[color:var(--color-text)]">
					<span>{user.points}</span>
					<span>⭐</span>
				</div>
			</div>
		{/each}
	</div>

	<!-- <div class="mt-4 flex items-center gap-4 text-sm text-[color:var(--color-text)]">
		<button
			class="px-2 py-1 border rounded disabled:opacity-30"
			onclick={() => currentPage = Math.max(currentPage - 1, 1)}
			disabled={currentPage === 1}
		>
			&lt;
		</button>

		<span>
            {from}–{to} <span class="font-bold">/</span> {allUsers.length}
        </span>

		<button
			class="px-2 py-1 border rounded disabled:opacity-30"
			onclick={() => currentPage = Math.min(currentPage + 1, totalPages)}
			disabled={currentPage === totalPages}
		>
			&gt;
		</button>
	</div> -->
</section>