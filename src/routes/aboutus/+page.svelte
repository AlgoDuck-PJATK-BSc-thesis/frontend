<script>
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import landingPageBackground from '$lib/images/LandingPage/Landing_page.gif';
</script>

<svelte:head>
	<title>About us - AlgoDuck</title>
</svelte:head>

<section class="mx-auto mt-16 max-w-3xl px-4 text-center">
	<img
		src={landingPageBackground}
		alt="landing page background"
		class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
	/>

	<h1
		class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ocra)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
	>
		About us
	</h1>

	<PixelFrame className="w-full px-18 pt-14 pb-14 text-left bg-black/60">
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
