<script lang="ts">
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';

	type Tab = { id: string; label: string };

	let { tabs, active, onChange } = $props<{
		tabs: Tab[];
		active: string;
		onChange: (id: string) => void;
	}>();

	function styles(isActive: boolean) {
		if (isActive) {
			return {
				bg: 'var(--color-header-user)',
				bgHover: 'var(--color-header-user)',
				fg: 'var(--color-landingpage-title)'
			};
		}

		return {
			bg: 'var(--color-header-user)',
			bgHover: 'color-mix(in srgb, var(--color-header-user) 75%, black)',
			fg: 'var(--color-landingpage-subtitle)'
		};
	}
</script>

<div class="flex flex-wrap items-center justify-center gap-2">
	{#each tabs as tab}
		{@const isActive = active === tab.id}
		{@const s = styles(isActive)}

		<PixelFrameMini
			style={`--tab-bg:${s.bg};--tab-bg-hover:${s.bgHover};`}
			className="bg-[var(--tab-bg)] hover:bg-[var(--tab-bg-hover)] transition"
		>
			<button
				type="button"
				onclick={() => onChange(tab.id)}
				aria-pressed={isActive}
				class="mx-1 my-1 rounded-[3px] bg-transparent px-2 py-1 text-sm font-semibold text-[var(--tab-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
				style={`--tab-fg:${s.fg};`}
			>
				{tab.label}
			</button>
		</PixelFrameMini>
	{/each}
</div>
