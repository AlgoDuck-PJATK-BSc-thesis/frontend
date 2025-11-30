<script lang="ts">
	import AnimatedPond from '$lib/Components/AnimatedPond.svelte';
	import HelperDuck from '$lib/Components/LayoutComponents/HelperDuck.svelte';

	let { data } = $props();

	let reduceMotion = false; // TODO: move this to pageLoad

	if (typeof window !== 'undefined') {
		reduceMotion = document.documentElement.dataset.reduceMotion === 'true';
	}
</script>

<svelte:head>
	<title>Home - AlgoDuck</title>
</svelte:head>

<main class="flex h-full w-full items-center justify-center overflow-hidden">
	<div class="h-[90%] w-[75%]">
		<HelperDuck
			selectedDuck={data.ducks[Math.floor(Math.random() * data.ducks.length)]}
			mode="solve"
		/>
		<AnimatedPond userDucks={data.ducks} />
	</div>
</main>
