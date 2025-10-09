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
			class="mt-2 mb-4 ml-2 text-6xl font-black tracking-widest text-[color:#fcd13f] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
			style="font-family: var(--font-ariw9500);"
		>
			AlgoDuck
		</h1>
		<p
			class="mb-10 text-2xl font-black tracking-widest text-[color:var(--color-landingpage)] [text-shadow:1.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
			style="font-family: var(--font-lexenddeca);"
		>
			Transform your coding skills, one problem at a time
		</p>

		<div class="mb-8 flex gap-4">
			<Button
				size="big"
				label="START"
				labelColor="[color:var(--color-text-button)]"
				labelFontSize="1.2rem"
				labelFontFamily="var(--font-lexenddeca)"
				labelFontWeight="bold"
				onclick={() => (window.location.href = '/login')}
			/>

			<!-- <Button
				size="big"
				label="LEARN MORE"
				labelColor="[color:var(--color-text-button)]"
				labelFontSize="1rem"
				labelFontFamily="var(--font-ariw9500)"
				labelFontWeight="normal"
				onclick={() => (window.location.href = '/learnmore')}
			/> -->
		</div>
	</div>
</section>

<svelte:head>
	<title>AlgoDuck</title>
</svelte:head>