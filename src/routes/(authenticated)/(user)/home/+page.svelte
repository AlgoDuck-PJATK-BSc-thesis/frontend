<script lang="ts">
	import type { StandardResponseDto } from '$lib/api/apiCall';
	import AnimatedPond from '$lib/Components/Misc/Pond/AnimatedPond.svelte';
	import type { OwnedUsedItems } from './proxy+page';

	let { data }: { data: StandardResponseDto<OwnedUsedItems>} = $props();

	let reduceMotion = false; // TODO: move this to pageLoad

	if (typeof window !== 'undefined') {
		reduceMotion = document.documentElement.dataset.reduceMotion === 'true';
	}

</script>

<svelte:head>
	<title>Home - AlgoDuck</title>
</svelte:head>

<main class="flex h-full w-full items-center justify-center overflow-hidden">
	<AnimatedPond userItems={{ ducks: data.body.ducks, plants: data.body.plants }} />
</main>
