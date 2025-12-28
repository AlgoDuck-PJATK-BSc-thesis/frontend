<script lang="ts">
	import AnimatedPond from '$lib/Components/Misc/Pond/AnimatedPond.svelte';
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
	<AnimatedPond userDucks={data.ducks} />
</main>
