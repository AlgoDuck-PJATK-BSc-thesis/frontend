<script>
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import landingPageBackground from '$lib/images/LandingPage/Landing_page.gif';
</script>

<svelte:head>
	<title>Log in - AlgoDuck</title>
</svelte:head>

<section class="mx-auto mt-14 max-w-90 text-center">
	<img
		src={landingPageBackground}
		alt="landing page background"
		class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
	/>
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
		Log In
	</h1>

	<PixelFrame className="flex w-full flex-col items-center bg-black/50 px-12 pt-4 pb-10">
		<form
			method="POST"
			class="mt-2 flex w-70 flex-col gap-2 text-left text-sm text-[color:var(--color-text)]"
		>
			<label class="flex flex-col">
				<span>Username or Email</span>
				<input
					type="text"
					name="identifier"
					required
					class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
				/>
			</label>

			<label class="flex flex-col">
				<span>Password</span>
				<input
					type="password"
					name="password"
					required
					class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
				/>
			</label>
		</form>

		<div class="mt-8 mb-5 flex justify-center">
			<Button
				size="big"
				label="LOG IN"
				labelColor="rgba(0, 0, 0, 0.7)"
				labelFontSize="1.2rem"
				labelFontFamily="var(--font-lexenddeca)"
				labelFontWeight="bold"
				onclick={() => document.querySelector('form')?.requestSubmit()}
			/>
		</div>

		<p class="mt-2 text-center leading-snug">
			<span>Don't have an account?</span>
			<a href="/signup" class="ml-1 font-semibold underline">Sign up</a>
		</p>
	</PixelFrame>
</section>
