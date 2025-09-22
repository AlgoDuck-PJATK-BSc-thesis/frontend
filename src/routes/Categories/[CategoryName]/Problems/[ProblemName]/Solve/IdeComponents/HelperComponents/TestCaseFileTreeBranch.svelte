<script lang="ts">
	import Chevron from '$lib/svg/chevron.svelte';
	import type { FileTreeBranchType } from '$lib/types/FileTreeTypes';
	import TestCaseFileTreeBranch from './TestCaseFileTreeBranch.svelte'; // lovely recursive import. Hope it does not break
	import TestCaseFileTreeLeaf from './TestCaseFileTreeLeaf.svelte';

	let { branch }: { branch: FileTreeBranchType } = $props();
	let isContentContainerShown: boolean = $state(true);
	let contentContainer: HTMLDivElement;

	const toggleContentContainer = (): void => {
		isContentContainerShown = !isContentContainerShown;
	};
</script>

<button
	onclick={toggleContentContainer}
	style={`padding-left: ${16 + 8 * branch.depth}px;`}
	class="m-1 text-text-secondary overflow-hidden w-full h-8 flex justify-start items-center text-center px-4 rounded-sm hover:cursor-pointer active:bg-ide-card active:border-ide-accent active:shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]"
>
	{#if branch.branchingBranches || branch.leaves}
		<div
			class="h-[40%] aspect-square text-center select-none m-1 {!isContentContainerShown
				? 'rotate-0'
				: 'rotate-90'}"
		>
			<Chevron args={{ color: '#FF13F0' }} />
		</div>
	{/if}
	<span class="px-2 flex justify-center items-center overflow-hidden">{branch.label}</span>
</button>
<div
	class="overflow-hidden pr-2 {!isContentContainerShown ? 'h-0' : ''}"
	bind:this={contentContainer}
>
	{#if branch.branchingBranches}
		{#each branch.branchingBranches as localBranch}
			<TestCaseFileTreeBranch branch={localBranch} />
		{/each}
	{:else if branch.leaves}
		{#each branch.leaves as leaf}
			<TestCaseFileTreeLeaf {leaf} />
		{/each}
	{/if}
</div>
