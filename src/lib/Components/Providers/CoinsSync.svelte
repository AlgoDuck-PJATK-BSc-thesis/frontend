<script lang="ts">
	import { onMount } from 'svelte';
	import { startCoinsSync } from '$lib/stores/coins';

	onMount(() => startCoinsSync(fetch));
</script>
