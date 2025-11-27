<script lang="ts">
    import { page } from '$app/state';
	import HeaderUser from '$lib/Components/Headers/HeaderUser.svelte';

	let { children } = $props();

	let hideHeader = $derived(page.data.hideHeader);
</script>

{#if !hideHeader}
    <HeaderUser />
{/if}

<div class="font-body flex min-h-screen flex-col bg-bg text-text transition-colors duration-300">
	<main class="h-[calc(100vh-4rem)] w-full box-border">
		{@render children?.()}
	</main>
</div>