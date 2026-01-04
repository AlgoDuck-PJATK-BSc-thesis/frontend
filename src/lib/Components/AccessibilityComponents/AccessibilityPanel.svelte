<script lang="ts">
	import { onMount } from 'svelte';
	import { applyContrast } from '$lib/Themes/UserThemes';
	import { applyThemeAdmin, type AdminTheme } from '$lib/Themes/AdminThemes';
	import { accessibility } from '$lib/stores/accessibility.svelte';

	export let toggleRef: ((fn: () => void) => void) | undefined;

	let isOpen = false;

	$: panelFontSize = `${10000 / accessibility.textSize}%`;

	function toggle() {
		isOpen = !isOpen;
	}

	onMount(() => {
		toggleRef?.(() => toggle());
	});

	$: if (typeof window !== 'undefined') {
		document.documentElement.style.fontSize = `${accessibility.textSize}%`;
		document.documentElement.dataset.contrast = accessibility.contrast.toString();
		document.documentElement.dataset.underlineLinks = accessibility.underlineLinks
			? 'true'
			: 'false';
		document.documentElement.dataset.reduceMotion = accessibility.reduceMotion ? 'true' : 'false';

		applyContrast(accessibility.contrast === 1 ? '1' : accessibility.contrast === 2 ? '2' : '0');
		applyThemeAdmin(({
			'1': 'contrast1' as AdminTheme,
			'2': 'contrast2' as AdminTheme,
		})[accessibility.contrast] ?? 'default')
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
	class="fixed right-0 bottom-30 z-[9999] w-64 overflow-y-auto border-2 border-[color:var(--color-text-a11y)] bg-[color:var(--color-bg-a11y)] text-[color:var(--color-text-a11y)]
  shadow-lg transition-transform duration-300"
	class:translate-x-0={isOpen}
	class:translate-x-full={!isOpen}
	style="font-size: {panelFontSize};"
>
	<div class="space-y-5 p-4 text-sm">
		<h2 class="text-lg font-bold">Accessibility</h2>

		<div class="space-y-1">
			<p class="font-semibold">Text size: {accessibility.textSize}%</p>
			<div class="flex flex-wrap gap-2">
				<button
					class="rounded border-2 px-2 py-1
                    hover:border-[color:var(--color-text-a11y)] hover:bg-[color:var(--color-text-a11y)] hover:text-[color:var(--color-bg-a11y)]"
					class:bg-[color:var(--color-text-a11y)]={accessibility.textSize === 120 ||
						accessibility.textSize === 140}
					class:text-[color:var(--color-bg-a11y)]={accessibility.textSize === 120 ||
						accessibility.textSize === 140}
					class:border-[color:var(--color-text-a11y)]={accessibility.textSize === 120 ||
						accessibility.textSize === 140}
					onclick={() => (accessibility.textSize = Math.min(accessibility.textSize + 20, 140))}
				>
					A+
				</button>
				<button
					class="rounded border-2 px-2 py-1 hover:border-[color:var(--color-text-a11y)] hover:bg-[color:var(--color-text-a11y)] hover:text-[color:var(--color-bg-a11y)]"
					class:bg-[color:var(--color-text-a11y)]={accessibility.textSize === 100}
					class:text-[color:var(--color-bg-a11y)]={accessibility.textSize === 100}
					class:border-[color:var(--color-text-a11y)]={accessibility.textSize === 100}
					onclick={() => (accessibility.textSize = 100)}
				>
					A
				</button>
				<button
					class="rounded border-2 px-2 py-1
                    hover:border-[color:var(--color-text-a11y)] hover:bg-[color:var(--color-text-a11y)] hover:text-[color:var(--color-bg-a11y)]"
					class:bg-[color:var(--color-text-a11y)]={accessibility.textSize === 80 ||
						accessibility.textSize === 60}
					class:text-[color:var(--color-bg-a11y)]={accessibility.textSize === 80 ||
						accessibility.textSize === 60}
					class:border-[color:var(--color-text-a11y)]={accessibility.textSize === 80 ||
						accessibility.textSize === 60}
					onclick={() => (accessibility.textSize = Math.max(accessibility.textSize - 20, 60))}
				>
					A−
				</button>
			</div>
		</div>

		<div class="space-y-1">
			<p class="font-semibold">Change contrast</p>
			<button
				class="w-full rounded border-2 px-2 py-2"
				onclick={() => (accessibility.contrast = (accessibility.contrast + 1) % 3)}
			>
				{#if accessibility.contrast === 0}
					Default
				{:else if accessibility.contrast === 1}
					High (Dark)
				{:else}
					High (Light)
				{/if}
			</button>
		</div>

		<div class="space-y-1">
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={accessibility.underlineLinks} />
				<span>Underline Links</span>
			</label>
		</div>

		<div class="space-y-1">
			<label class="flex cursor-pointer items-center gap-2">
				<input type="checkbox" bind:checked={accessibility.reduceMotion} />
				<span>Reduce Motion</span>
			</label>
		</div>
	</div>
</div>
