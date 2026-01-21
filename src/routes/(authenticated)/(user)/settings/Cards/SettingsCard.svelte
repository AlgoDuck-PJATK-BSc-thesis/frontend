<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	export let id: string;
	export let title: string;
	export let className: string = '';
</script>

<PixelFrameSimple {id} className={`relative w-full p-8 ${className}`.trim()}>
	<h2 class="mb-2 text-2xl font-bold text-[color:var(--color-landingpage-subtitle)]">{title}</h2>
	<slot />
</PixelFrameSimple>
