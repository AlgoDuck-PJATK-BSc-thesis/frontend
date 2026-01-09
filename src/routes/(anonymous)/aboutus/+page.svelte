<script>
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
</script>

<svelte:head>
	<title>About us - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-3xl px-4 text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			About Us
		</h1>

		<div
			class="relative z-10 flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-left text-[var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
		>
			<p class="text-base leading-relaxed opacity-95">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin fringilla feugiat elementum.
				Aliquam auctor justo leo, ut egestas metus viverra ac. Cras in ornare lacus, quis aliquet
				risus. Duis lacinia dolor at tincidunt maximus. Phasellus semper neque augue, at tincidunt
				ipsum cursus laoreet. Proin consequat et metus nec efficitur. Praesent imperdiet, ipsum quis
				dapibus efficitur, dolor enim feugiat eros, sit amet semper metus lorem ac lorem.
				<br />
				<br />
				Proin luctus sit amet felis eu ornare. Suspendisse rutrum, libero ut maximus porttitor, nisl
				nibh sodales leo, a mattis tellus nisl vel mi. Pellentesque habitant morbi tristique senectus
				et netus et malesuada fames ac turpis egestas. Fusce eu sollicitudin nisi. Pellentesque habitant
				morbi tristique senectus et netus et malesuada fames ac turpis egestas.
				<br />
				<br />
				Duis vitae dolor lobortis, imperdiet orci non, sollicitudin ex. Etiam ante nisi, auctor in accumsan
				in, convallis eu quam. Fusce at dolor interdum, dapibus leo vel, rhoncus ex. Suspendisse et condimentum
				lacus, vel commodo dolor. Quisque sem nisi, congue et nibh at, volutpat mollis orci.
			</p>
		</div>
	</div>
</section>
