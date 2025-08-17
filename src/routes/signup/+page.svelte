<script>
	import Button from '../../Components/ButtonComponents/Button.svelte';
	import PixelFrame from '../../Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
</script>

<svelte:head>
	<title>Sign up – Beetcode</title>
</svelte:head>

<section class="mx-auto mt-16 max-w-md text-center">
	<h1
		class="mt-1 mb-10 text-6xl text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);"
	>
		Sign up
	</h1>

	<PixelFrame
		className="flex w-full flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] px-16 pt-8 pb-8"
	>
		<form method="POST" class="mt-2 flex w-80 flex-col gap-4">
			<label class="flex flex-col text-left text-sm text-[color:var(--color-text)]">
				<span>Username</span>
				<input
					type="text"
					name="username"
					required
					class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
				/>
			</label>

			<label class="flex flex-col text-left text-sm text-[color:var(--color-text)]">
				<span>Email</span>
				<input
					type="email"
					name="email"
					required
					class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
				/>
			</label>

			<label class="flex flex-col text-left text-sm text-[color:var(--color-text)]">
				<span>Password</span>
				<input
					type="password"
					name="password"
					required
					class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
				/>
			</label>

			<div class="mt-3 flex justify-center">
				<Button
					size="big"
					label="Create account"
					labelColor="[color:var(--color-text-button)]"
					labelFontSize="1.1rem"
					labelFontFamily="var(--font-ariw9500)"
					labelFontWeight="normal"
					onclick={() => document.querySelector('form')?.requestSubmit()}
				/>
			</div>
		</form>

		<p class="mt-8 text-center leading-snug">
			<span>Already have an account?</span>
			<a href="/login" class="ml-1 font-semibold text-[color:var(--color-accent-2)] hover:underline"
				>Log in</a
			>
		</p>
	</PixelFrame>
</section>
