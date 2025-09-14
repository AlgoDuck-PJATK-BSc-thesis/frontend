<script lang="ts">
	import Ide from './Ide.svelte';
	import type { Problem } from './Types/Problem';
	
	let { data }: { data: {hideHeader:boolean, problem: Problem} } = $props();
</script>

<main class="w-full h-[100vh] bg-ide-bg">
	<Ide problemDto={data.problem} />
</main>
