<script lang="ts">
	import MarkdownRenderer from './GenericComponents/MarkdownRenderer.svelte';
	import type { Problem } from './Types/Problem';

	let { problemDto }: { problemDto: Problem } = $props();
</script>

<main
	class="w-full h-full flex flex-col justify-start bg-ide-card overflow-y-scroll overflow-x-clip"
>
	<div class="h-[10%] flex flex-col-reverse text-4xl p-5 font-bold">
		<h2 class="select-none text-text-secondary">{problemDto.title}</h2>
	</div>
	<div class="flex justify-start flex-wrap overflow-clip p-3">
		{@render TagPill(problemDto.difficulty.name)}
		{#each problemDto.tags as tag}
			{@render TagPill(tag)}
		{/each}
	</div>
	<MarkdownRenderer markdown={problemDto.description} />
</main>

{#snippet TagPill(tagContents: string)}
	<div
		class="h-5 text-xs justify-center items-center text-center select-none rounded-full m-1 px-4 border-2 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]"
	>
		<span>{tagContents}</span>
	</div>
{/snippet}
