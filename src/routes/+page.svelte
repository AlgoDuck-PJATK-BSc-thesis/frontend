<script lang="ts">
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import LandingPage from '$lib/Components/LandingPage.svelte';
</script>

<section class="relative h-[calc(100vh-65px)] w-full overflow-hidden">
	<LandingPage />

	<div class="relative z-20 flex h-full items-start">
		<div class="max-w-8xl mx-auto w-full px-4 pt-[12vh] text-center">
			<h1
				class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-7xl font-black tracking-widest text-[var(--color-landingpage-title)]"
			>
				AlgoDuck
			</h1>

			<p
				class="ocr-subtitle ocr-outline mt-1 mb-10 [font-family:var(--font-ocra)] text-2xl text-[var(--color-landingpage-subtitle)] [word-spacing:0.4em]"
			>
				Click to start your journey to mastering<br /> Data Structures and Algorithms
			</p>

			<div class="mb-8 flex justify-center gap-4">
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
			</div>
		</div>
	</div>
</section>

<svelte:head>
	<title>AlgoDuck</title>
</svelte:head>
