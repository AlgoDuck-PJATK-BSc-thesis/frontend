<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	onMount(async () => {
		const qs = page.url.searchParams.toString();
		await goto(qs ? `/auth/email-confirmed?${qs}` : '/auth/email-confirmed');
	});
</script>

<svelte:head>
	<title>Confirm email - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden"></section>
