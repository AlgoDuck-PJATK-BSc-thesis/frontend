<script lang="ts">
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import landingPageBackground from '$lib/images/LandingPage/Landing_page.gif';
</script>

<section class="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
	<img
		src={landingPageBackground}
		alt="landing page background"
		class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
	/>

	<div class="relative z-20 flex flex-col items-center px-5 py-45 text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ocra)] text-7xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			AlgoDuck
		</h1>
		<p
			class="ocr-subtitle ocr-outline mt-1 mb-10 [font-family:var(--font-ocra)] text-2xl font-black tracking-widest text-[var(--color-landingpage-description)]"
		>
			Click to start your journey to mastering<br /> Data Structures and Algorithms
		</p>

		<div class="mb-8 flex gap-4">
			<div class="animate-side-bounce inline-block">
				<Button
					size="medium"
					label="→"
					labelFontFamily="var(--font-ariw9500)"
					labelColor="rgba(0,0,0,0.7)"
					labelFontSize="2rem"
					labelFontWeight="normal"
					labelTracking="extra"
					labelClass=""
					onclick={() => (window.location.href = '/signup')}
				/>
			</div>

			<!-- <Button
				size="bigger"
				label="Learn more"
				labelColor="#ffffff"
				labelFontSize="1.25rem"
				labelFontFamily="var(--font-ocra)"
				labelFontWeight="bold"
				labelClass="ocr-outline ocr-subtitle"
				onclick={() => (window.location.href = '/learnmore')}
			/> -->
		</div>
	</div>
</section>

<svelte:head>
	<title>AlgoDuck</title>
</svelte:head>
