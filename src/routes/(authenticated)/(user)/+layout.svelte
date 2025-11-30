<script lang="ts">
	import { page } from '$app/state';
	import HeaderUser from '$lib/Components/Headers/HeaderUser.svelte';

	let { children } = $props();

	let hideHeader = $derived(page.data.hideHeader);
</script>

<main class="w-full h-full flex flex-col">
	{#if !hideHeader}
		<HeaderUser />
	{/if}
	
	<div class="font-body flex h-full flex-col bg-bg text-text transition-colors duration-300">
		{@render children?.()}
	</div>
</main>
