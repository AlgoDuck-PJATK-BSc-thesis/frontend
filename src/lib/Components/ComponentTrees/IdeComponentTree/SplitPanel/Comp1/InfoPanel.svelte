<script lang="ts">
	import MarkdownRenderer from '$lib/Components/Misc/MarkdownRenderer.svelte';
	import type { InfoPanelComponentArgs } from '$lib/types/ComponentLoadArgs';

	let { options = $bindable() }: { options: InfoPanelComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col justify-start bg-ide-card overflow-y-scroll overflow-x-hidden min-w-xl px-6 rounded-xl">
	<div class="h-[10%] flex flex-col-reverse text-4xl p-5 font-bold">
		<h2 class="select-none text-text-secondary">{options.problem.title}</h2>
	</div>
	<div class="flex justify-start flex-wrap overflow-clip p-3">
		{@render TagPill(options.problem.title)}
		{#each options.problem.tags as tag}
			{@render TagPill(tag)}
		{/each}
	</div>
	<MarkdownRenderer markdown={options.problem.description} />
</main>

{#snippet TagPill(tagContents: string)}
	<div
		class="h-5 text-xs justify-center items-center text-center select-none rounded-full m-1 px-4 border-2 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]"
	>
		<span>{tagContents}</span>
	</div>
{/snippet}
