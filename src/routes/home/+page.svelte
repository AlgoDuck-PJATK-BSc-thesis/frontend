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
	<title>Home – AlgoDuck</title>
</svelte:head>

<main class="w-full h-full flex justify-center items-center overflow-auto">
	<div class="w-[75%] h-[90%]">
		<HelperDuck selectedDuck={data.ducks[Math.floor(Math.random() * data.ducks.length)]} mode="solve"/>
		<AnimatedPond userDucks={data.ducks}/>
	</div>
</main>
