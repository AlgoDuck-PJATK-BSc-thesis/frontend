<script lang="ts">
	import type { Problem } from '$lib/types/Problem';
	import Ide from './Ide.svelte';
	
	let { data }: { data: {hideHeader:boolean, problem: Problem} } = $props();
</script>

<main class="w-full h-[100vh] bg-ide-bg">
	<Ide problemDto={data.problem} />
</main>
