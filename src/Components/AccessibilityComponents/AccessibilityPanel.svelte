<script lang="ts">
	import { onMount } from 'svelte';
    import { stopPropagation } from '$lib/actions/stopPropagation';

	export let toggleRef: ((fn: () => void) => void) | undefined;

	let isOpen = false;

	let textSize = 100; 
	let contrast = 0;
	let underlineLinks = false;
	let reduceMotion = false;

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
		class="fixed inset-0 z-[9998] bg-transparent cursor-default"
		onclick={toggle}
		aria-label="Close accessibility panel"
	>
	</button>
{/if}


<div
	class="fixed bottom-40 right-0 w-64 z-[9999] border-2 shadow-lg overflow-y-auto transition-transform duration-300
	bg-white text-black border-black dark:border-white dark:bg-[color:var(--color-bg)] dark:text-[color:var(--color-text)]"
	class:translate-x-0={isOpen}
	class:translate-x-full={!isOpen}
>
	<div class="p-4 space-y-5 text-sm">
		<h2 class="font-bold text-lg">Accessibility</h2>

		<div class="space-y-1">
			<p class="font-semibold">Text size</p>
			<div class="flex gap-2 flex-wrap">
				<button
					class="px-2 py-1 border-2 rounded
                    hover:bg-black hover:text-white
		            dark:hover:bg-white dark:hover:text-black"
					onclick={() => (textSize = Math.min(textSize + 20, 140))}
				>
					A+
				</button>
				<button
					class="px-2 py-1 border-2 rounded"
					class:bg-black={textSize === 100}
					class:text-white={textSize === 100}
					class:dark:bg-white={textSize === 100}
					class:dark:text-black={textSize === 100}
					onclick={() => (textSize = 100)}
				>
					A
				</button>
                <button
					class="px-2 py-1 border-2 rounded
                    hover:bg-black hover:text-white
		            dark:hover:bg-white dark:hover:text-black"
					onclick={() => (textSize = Math.max(textSize - 10, 70))}
				>
					A−
				</button>
			</div>
		</div>

		<div class="space-y-1">
			<p class="font-semibold">Change contrast</p>
			<button class="px-2 py-2 border-2 rounded w-full" onclick={() => (contrast = (contrast + 1) % 3)}>
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
			<label class="flex items-center gap-2 cursor-pointer">
				<input type="checkbox" bind:checked={underlineLinks} />
				<span>Underline Links</span>
			</label>
		</div>

		<div class="space-y-1">
			<label class="flex items-center gap-2 cursor-pointer">
				<input type="checkbox" bind:checked={reduceMotion} />
				<span>Reduce Motion</span>
			</label>
		</div>
	</div>
</div>
