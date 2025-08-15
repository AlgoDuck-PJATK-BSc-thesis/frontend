<svelte:head>
	<title>Sign up – Beetcode</title>
</svelte:head>

<script>
	import Button from '../../Components/ButtonComponents/Button.svelte';
</script>

<section
	class="mx-auto mt-20 max-w-md rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 px-4 text-center"
>
	<h1
		class="mb-8 text-4xl text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);"
	>
		Sign up
	</h1>

	<form method="POST" class="flex flex-col gap-4">
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

		<div class="flex justify-center">
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

	<p class="mt-6 text-center text-xs leading-snug">
		<span>Already have an account?</span>
		<a href="/login" class="ml-1 text-[color:var(--color-accent-2)] hover:underline">Log in</a>
	</p>
</section>
