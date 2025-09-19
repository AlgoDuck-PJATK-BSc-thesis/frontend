<script>
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
</script>

<svelte:head>
	<title>Log in – AlgoDuck</title>
</svelte:head>

<section class="mx-auto mt-14 max-w-90 text-center">
	<h1
		class="mt-2 mb-10 ml-2 text-6xl font-black tracking-widest text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
		style="font-family: var(--font-ariw9500);"
	>
		Log in
	</h1>

	<PixelFrame
		className="flex w-full flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] px-12 pt-4 pb-10"
	>
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
	</PixelFrame>

	<div class="mt-8 mb-5 flex justify-center">
		<Button
			size="big"
			label="LOG IN"
			labelColor="[color:var(--color-text-button)]"
			labelFontSize="1.1rem"
			labelFontFamily="var(--font-ariw9500)"
			labelFontWeight="bold"
			onclick={() => document.querySelector('form')?.requestSubmit()}
		/>
	</div>

	<p class="mt-2 text-center leading-snug">
		<span>Don't have an account?</span>
		<a href="/signup" class="ml-1 font-semibold text-[color:var(--color-accent-2)] hover:underline"
			>Sign up</a
		>
	</p>
</section>
