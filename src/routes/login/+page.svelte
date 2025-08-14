<svelte:head>
	<title>Log in – Beetcode</title>
</svelte:head>

<section
	class="mx-auto mt-20 max-w-md rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 px-4 text-center"
>
	<h1
		class="mb-8 text-4xl text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);"
	>
		Log in
	</h1>

	<form method="POST" class="flex flex-col gap-4 text-left text-sm text-[color:var(--color-text)]">
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

		<div class="flex justify-center">
			<button
				type="submit"
				class="font-body w-1/3 cursor-pointer rounded bg-[var(--color-primary)] px-6 py-2.5 text-[var(--color-bg)] transition-transform duration-200 hover:-translate-y-0.5"
			>
				Log in
			</button>
		</div>
	</form>

	<p class="mt-6 text-center text-xs leading-snug">
		<span>Don't have an account?</span>
		<a href="/signup" class="ml-1 text-[color:var(--color-accent-2)] hover:underline">Sign up</a>
	</p>
</section>
