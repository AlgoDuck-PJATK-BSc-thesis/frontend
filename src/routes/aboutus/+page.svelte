<script>
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
</script>

<svelte:head>
	<title>About us - AlgoDuck</title>
</svelte:head>

<section class="mx-auto mt-16 max-w-3xl px-4 text-center">
	<h1
		class="mt-2 mb-10 ml-2 text-6xl font-black tracking-widest text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
		style="font-family: var(--font-ariw9500);"
	>
		About us
	</h1>

	<PixelFrame
		className="w-full px-10 pt-10 pb-10 text-left bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))]"
	>
		<p class="text-base leading-relaxed text-[color:var(--color-text)]">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in
			faucibus orci luctus et ultrices posuere cubilia curae. Sed sit amet accumsan arcu. Nulla
			facilisi.
		</p>
	</PixelFrame>
</section>
