<script lang="ts">
	import { onMount } from 'svelte';
	import { stopPropagation } from '$lib/actions/stopPropagation';

	export let toggleRef: ((fn: () => void) => void) | undefined;

	let isOpen = false;

	let textSize = 100;
	let contrast = 0;
	let underlineLinks = false;
	let reduceMotion = false;

	$: panelFontSize = `${10000 / textSize}%`;

	function toggle() {
		isOpen = !isOpen;
	}

	onMount(() => {
		toggleRef?.(() => toggle());
	});

	$: if (typeof window !== 'undefined') {
		document.documentElement.style.fontSize = `${textSize}%`;
		document.documentElement.dataset.contrast = contrast.toString();
		document.documentElement.dataset.underlineLinks = underlineLinks ? 'true' : 'false';
		document.documentElement.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
	}
</script>

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-[9998] cursor-default bg-transparent"
		onclick={toggle}
		aria-label="Close accessibility panel"
	>
	</button>
{/if}

<div
	class="fixed right-0 bottom-40 z-[9999] w-64 overflow-y-auto border-2 border-[color:var(--color-text-a11y)] bg-[color:var(--color-bg-a11y)] text-[color:var(--color-text-a11y)]
	shadow-lg transition-transform duration-300"
	class:translate-x-0={isOpen}
	class:translate-x-full={!isOpen}
	style="font-size: {panelFontSize};"
>
	<div class="space-y-5 p-4 text-sm">
		<h2 class="text-lg font-bold">Accessibility</h2>

		<div class="space-y-1">
			<p class="font-semibold">Text size: {textSize}%</p>
			<div class="flex flex-wrap gap-2">
				<button
					class="rounded border-2 px-2 py-1
                    hover:border-[color:var(--color-text-a11y)] hover:bg-[color:var(--color-text-a11y)] hover:text-[color:var(--color-bg-a11y)]"
					class:bg-[color:var(--color-text-a11y)]={textSize === 120 || textSize === 140}
					class:text-[color:var(--color-bg-a11y)]={textSize === 120 || textSize === 140}
					class:border-[color:var(--color-text-a11y)]={textSize === 120 || textSize === 140}
					onclick={() => (textSize = Math.min(textSize + 20, 140))}
				>
					A+
				</button>
				<button
					class="rounded border-2 px-2 py-1 hover:border-[color:var(--color-text-a11y)] hover:bg-[color:var(--color-text-a11y)] hover:text-[color:var(--color-bg-a11y)]"
					class:bg-[color:var(--color-text-a11y)]={textSize === 100}
					class:text-[color:var(--color-bg-a11y)]={textSize === 100}
					class:border-[color:var(--color-text-a11y)]={textSize === 100}
					onclick={() => (textSize = 100)}
				>
					A
				</button>
				<button
					class="rounded border-2 px-2 py-1
                    hover:border-[color:var(--color-text-a11y)] hover:bg-[color:var(--color-text-a11y)] hover:text-[color:var(--color-bg-a11y)]"
					class:bg-[color:var(--color-text-a11y)]={textSize === 80 || textSize === 60}
					class:text-[color:var(--color-bg-a11y)]={textSize === 80 || textSize === 60}
					class:border-[color:var(--color-text-a11y)]={textSize === 80 || textSize === 60}
					onclick={() => (textSize = Math.max(textSize - 20, 60))}
				>
					A−
				</button>
			</div>
		</div>

		<div class="space-y-1">
			<p class="font-semibold">Change contrast</p>
			<button
				class="w-full rounded border-2 px-2 py-2"
				onclick={() => (contrast = (contrast + 1) % 3)}
			>
				{#if contrast === 0}
					Default
				{:else if contrast === 1}
					High (Dark)
				{:else}
					High (Light)
				{/if}
			</button>
		</div>

		<div class="space-y-1">
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={underlineLinks} />
				<span>Underline Links</span>
			</label>
		</div>

		<div class="space-y-1">
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={reduceMotion} />
				<span>Reduce Motion</span>
			</label>
		</div>
	</div>
</div>
