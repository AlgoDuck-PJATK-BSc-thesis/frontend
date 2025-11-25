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
			class="isolate mt-2 mb-10 ml-2
		[font-family:var(--font-ariw9500)]
		text-6xl font-black tracking-widest
		text-[var(--color-landingpage-title)]
		shadow-none drop-shadow-none filter-none backdrop-filter-none
		[--dx:6px] [--dy:5px]
		[--shadow:rgba(0,0,0,0.7)]
		[--stroke-color:rgba(0,0,0,0.7)]
		[--stroke:5px]
		[-webkit-text-stroke:var(--stroke)_var(--stroke-color)]
		[paint-order:stroke_fill]
		[text-shadow:var(--dx)_var(--dy)_0_var(--shadow)]
		supports-[not(-webkit-text-stroke:1px_black)]:[text-shadow:var(--dx)_var(--dy)_0_var(--shadow),0_1px_0_var(--stroke-color),0_-1px_0_var(--stroke-color),1px_0_0_var(--stroke-color),-1px_0_0_var(--stroke-color),1px_1px_0_var(--stroke-color),1px_-1px_0_var(--stroke-color),-1px_1px_0_var(--stroke-color),-1px_-1px_0_var(--stroke-color),0_2px_0_var(--stroke-color),0_-2px_0_var(--stroke-color),2px_0_0_var(--stroke-color),-2px_0_0_var(--stroke-color),2px_2px_0_var(--stroke-color),2px_-2px_0_var(--stroke-color),-2px_2px_0_var(--stroke-color),-2px_-2px_0_var(--stroke-color)]"
		>
			AlgoDuck
		</h1>
		<p
			class="mt-1 mb-10
		[font-family:var(--font-lexenddeca)]
		text-2xl font-black tracking-widest
		text-[var(--color-landingpage-description)]
		[--stroke-color:rgba(0,0,0,0.7)] [--stroke:5px]
		[-webkit-text-stroke:var(--stroke)_var(--stroke-color)]
		[paint-order:stroke_fill]
		supports-[not(-webkit-text-stroke:1px_black)]:[text-shadow:0_1px_0_var(--stroke-color),0_-1px_0_var(--stroke-color),1px_0_0_var(--stroke-color),-1px_0_0_var(--stroke-color),1px_1px_0_var(--stroke-color),1px_-1px_0_var(--stroke-color),-1px_1px_0_var(--stroke-color),-1px_-1px_0_var(--stroke-color)]"
		>
			Transform your coding skills, one problem at a time
		</p>

		<div class="mb-8 flex gap-4">
			<Button
				size="big"
				label="START"
				labelColor="rgba(0, 0, 0, 0.7)"
				labelFontSize="1.2rem"
				labelFontFamily="var(--font-lexenddeca)"
				labelFontWeight="bold"
				onclick={() => (window.location.href = '/login')}
			/>

			<!-- <Button
				size="big"
				label="LEARN MORE"
				labelColor="rgba(0, 0, 0, 0.7)"
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
