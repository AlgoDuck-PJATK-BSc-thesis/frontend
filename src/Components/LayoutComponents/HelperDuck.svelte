<script lang="ts">
	import { onMount } from 'svelte';
	import duck from '$lib/images/ducks/duck.png';

	export let mode: 'home' | 'solve' = 'home';

	const problemCategories = [
		'array',
		'loop',
		'string manipulation',
		'graph traversal',
		'tree',
		'sorting algorithms',
		'dynamic programming',
		'bit manipulation',
		'greedy algorithms'
	];

	let currentCategory = '';

	onMount(() => {
		let interval: number;

		if (mode === 'home') {
			const updateCategory = () => {
				const lastUpdate = localStorage.getItem('lastCategoryUpdate');
				const now = Date.now();

				if (!lastUpdate || now - Number(lastUpdate) > 1000 * 60 * 60 * 24) {
					const random = problemCategories[Math.floor(Math.random() * problemCategories.length)];
					currentCategory = random;
					localStorage.setItem('currentCategory', random);
					localStorage.setItem('lastCategoryUpdate', now.toString());
				} else {
					const saved = localStorage.getItem('currentCategory');
					if (saved) currentCategory = saved;
				}
			};

			updateCategory();
			interval = setInterval(updateCategory, 1000 * 60 * 60 * 24);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

<div class="relative mt-8 h-28">
	<div class="absolute top-0 left-1/2 flex -translate-x-[160px] items-center gap-4">
		<div class="relative">
			<button
				class="mr-2 h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-[color:var(--color-primary)] p-0 shadow-md"
				style="aspect-ratio: 1 / 1;"
			>
				<img
					src={duck}
					alt="duck"
					class="h-full w-full -translate-x-[-15%] -translate-y-[-10%] scale-[1.5] object-cover object-[left_top]"
				/>
			</button>

			<p class="mt-1 text-sm font-semibold text-[color:var(--color-white)]">Helper Duck</p>

			<div
				class="absolute top-1/2 left-full ml-3 w-max max-w-[310px] -translate-y-1/2 rounded-2xl bg-white px-4 py-3 whitespace-normal text-black shadow
				after:absolute after:top-1/2 after:-left-2 after:-translate-y-1/2 after:border-[8px] after:border-transparent after:border-r-white after:content-['']"
			>
				<div
					class="absolute top-1/2 left-0 h-0 w-0
					-translate-x-full -translate-y-1/2 border-y-[6px] border-r-[8px] border-y-transparent border-r-white"
				></div>

				{#if mode === 'home'}
					Hey!<br />
					Let's solve some {currentCategory} problems today!
				{:else if mode === 'solve'}
					...
				{/if}
			</div>
		</div>
	</div>
</div>
