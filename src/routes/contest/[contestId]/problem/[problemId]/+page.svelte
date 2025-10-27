<script lang="ts">
	import SolvePage from '../../../../categories/[CategoryName]/Problems/[ProblemName]/Solve/+page.svelte';
	import type { Problem } from '$lib/types/Problem';

	let { data }: { data: { hideHeader: boolean; problem: Problem } } = $props();
</script>

<SolvePage {data} />
