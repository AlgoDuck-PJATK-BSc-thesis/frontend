<script>
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
</script>

<svelte:head>
	<title>About us - AlgoDuck</title>
</svelte:head>

<section class="mx-auto mt-16 max-w-3xl px-4 text-center">
	<h1
		class="isolate mt-2 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl
       font-black tracking-widest text-[var(--color-primary)]
       shadow-none drop-shadow-none filter-none backdrop-filter-none
       [--dx:6px] [--dy:4px] [--stroke:5px]
       [-webkit-text-stroke-color:var(--shadow-header)]
       [-webkit-text-stroke-width:var(--stroke)]
       [paint-order:stroke_fill]
       [text-shadow:var(--dx)_var(--dy)_0_var(--shadow-header)]
       supports-[not(-webkit-text-stroke:1px_black)]:[text-shadow:var(--dx)_var(--dy)_0_var(--shadow-header),0_1px_0_var(--shadow-header),0_-1px_0_var(--shadow-header),1px_0_0_var(--shadow-header),-1px_0_0_var(--shadow-header),1px_1px_0_var(--shadow-header),1px_-1px_0_var(--shadow-header),-1px_1px_0_var(--shadow-header),-1px_-1px_0_var(--shadow-header),0_2px_0_var(--shadow-header),0_-2px_0_var(--shadow-header),2px_0_0_var(--shadow-header),-2px_0_0_var(--shadow-header),2px_2px_0_var(--shadow-header),2px_-2px_0_var(--shadow-header),-2px_2px_0_var(--shadow-header),-2px_-2px_0_var(--shadow-header)]"
	>
		About us
	</h1>

	<PixelFrame
		className="w-full px-10 pt-10 pb-10 text-left bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<p class="text-base leading-relaxed text-[color:var(--color-text)]">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin fringilla feugiat elementum.
			Aliquam auctor justo leo, ut egestas metus viverra ac. Cras in ornare lacus, quis aliquet
			risus. Duis lacinia dolor at tincidunt maximus. Phasellus semper neque augue, at tincidunt
			ipsum cursus laoreet. Proin consequat et metus nec efficitur. Praesent imperdiet, ipsum quis
			dapibus efficitur, dolor enim feugiat eros, sit amet semper metus lorem ac lorem. Proin luctus
			sit amet felis eu ornare. Suspendisse rutrum, libero ut maximus porttitor, nisl nibh sodales
			leo, a mattis tellus nisl vel mi. Pellentesque habitant morbi tristique senectus et netus et
			malesuada fames ac turpis egestas. Fusce eu sollicitudin nisi. Pellentesque habitant morbi
			tristique senectus et netus et malesuada fames ac turpis egestas. Duis vitae dolor lobortis,
			imperdiet orci non, sollicitudin ex. Etiam ante nisi, auctor in accumsan in, convallis eu
			quam. Fusce at dolor interdum, dapibus leo vel, rhoncus ex. Suspendisse et condimentum lacus,
			vel commodo dolor. Quisque sem nisi, congue et nibh at, volutpat mollis orci.
		</p>
	</PixelFrame>
</section>
