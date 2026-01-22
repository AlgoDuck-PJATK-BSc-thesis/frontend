<script lang="ts">
	import type { Snippet } from 'svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	let {
		id,
		title,
		className = '',
		children
	} = $props<{
		id: string;
		title: string;
		className?: string;
		children?: Snippet;
	}>();
</script>

<PixelFrameSimple {id} className={`relative w-full p-8 ${className}`.trim()}>
	<h2 class="mb-2 text-2xl font-bold text-[color:var(--color-landingpage-subtitle)]">{title}</h2>
	{@render children?.()}
</PixelFrameSimple>
