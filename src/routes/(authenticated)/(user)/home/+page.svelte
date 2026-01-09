<script lang="ts">
	import type { StandardResponseDto } from '$lib/api/apiCall';
	import type { OwnedUsedItems } from './proxy+page';
	import Pond from './refactor/Pond.svelte';

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
	<Pond userItems={{ ducks: data.body.ducks, plants: data.body.plants }} />
</main>
