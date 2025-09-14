<script lang="ts">
	import Chevron from '../svg/chevron.svelte';
	import type { FileTreeRootType } from './FileTreeTypes';
	import TestCaseFileTreeBranch from './TestCaseFileTreeBranch.svelte';

	let { root }: { root: FileTreeRootType } = $props();

	let isContentContainerShown: boolean = $state(true);
	let contentContainer: HTMLDivElement;

	const toggleContentContainer = (): void => {
		isContentContainerShown = !isContentContainerShown;
	};
</script>

<main class="h-full px-2">
	<button
		class="h-8 m-1 text-text-secondary overflow-hidden w-full flex justify-start items-center text-center px-4 rounded-sm hover:cursor-pointer active:bg-ide-card active:border-ide-accent active:shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]"
		style={`padding-left: ${16 + 8 * root.depth}px;`}
		onclick={toggleContentContainer}
	>
		{#if root.nearRootBranches}
			<div
				class="h-[40%] aspect-square text-center select-none m-1 {!isContentContainerShown
					? 'rotate-0'
					: 'rotate-90'}"
			>
				<Chevron args={{ color: '#FF13F0' }} />
			</div>
		{/if}
		<span class="px-2 flex justify-center items-center overflow-hidden">{root.label}</span>
	</button>
	<div
		class="overflow-hidden pr-2 {!isContentContainerShown ? 'h-0' : ''}"
		bind:this={contentContainer}
	>
		{#if root.nearRootBranches}
			{#each root.nearRootBranches as branch}
				<TestCaseFileTreeBranch {branch} />
			{/each}
		{/if}
	</div>
</main>
