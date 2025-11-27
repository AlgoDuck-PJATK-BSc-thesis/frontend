<script>
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import landingPageBackground from '$lib/images/LandingPage/Landing_page.gif';
</script>

<svelte:head>
	<title>Learn more - AlgoDuck</title>
</svelte:head>

<section class="mx-auto mt-16 max-w-4xl px-4">
	<img
		src={landingPageBackground}
		alt="landing page background"
		class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
	/>

	<h1
		class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ocra)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
	>
		How Beetcode works
	</h1>

	<PixelFrame className="flex w-full flex-col items-center bg-black/60 px-14 pt-12 pb-14">
		<ol class="flex list-none flex-col gap-8 p-0">
			<li>
				<h2 class="mb-2 text-xl font-semibold text-[color:var(--color-accent-2)]">1. Sign up</h2>
				<p class="text-base leading-relaxed text-[color:var(--color-text)]">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a metus vitae lorem
					facilisis bibendum.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold text-[color:var(--color-accent-2)]">
					2. Choose a challenge
				</h2>
				<p class="text-base leading-relaxed text-[color:var(--color-text)]">
					Sed non risus id purus congue rutrum. Duis vel dapibus erat, sed tristique tellus.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold text-[color:var(--color-accent-2)]">
					3. Collect ducks!
				</h2>
				<p class="text-base leading-relaxed text-[color:var(--color-text)]">
					Phasellus nec metus sed lorem sodales gravida. Etiam ut nisi nec nisl fermentum congue.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold text-[color:var(--color-accent-2)]">
					4. Track your progress
				</h2>
				<p class="text-base leading-relaxed text-[color:var(--color-text)]">
					Aenean a erat et nisl euismod rhoncus nec a justo. Suspendisse potenti.
				</p>
			</li>
		</ol>
	</PixelFrame>
</section>
