<svelte:head>
	<title>Log in – Beetcode</title>
</svelte:head>

<section class="max-w-md mx-auto mt-20 px-4 text-center border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-tile)] p-4 rounded-xl">
	<h1 class="text-4xl text-[color:var(--color-primary)] mb-8"
		style="font-family: var(--font-ariw9500);">
		Log in
	</h1>

	<form method="POST" class="flex flex-col gap-4 text-left text-sm text-[color:var(--color-text)]">
		<label class="flex flex-col">
			<span>Username or Email</span>
			<input
				type="text"
				name="identifier"
				required
				class="mt-2 p-2.5 border-2 border-[color:var(--color-accent-1)] rounded bg-white text-black font-body"
			/>
		</label>

		<label class="flex flex-col">
			<span>Password</span>
			<input
				type="password"
				name="password"
				required
				class="mt-2 p-2.5 border-2 border-[color:var(--color-accent-1)] rounded bg-white text-black font-body"
			/>
		</label>

		<div class="flex justify-center">
			<button
				type="submit"
				class="w-1/3 bg-[var(--color-primary)] text-[var(--color-bg)] px-6 py-2.5 rounded font-body cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
			>
				Log in
			</button>
		</div>

	</form>

	<p class="mt-6 text-xs leading-snug text-center">
		<span>Don't have an account?</span>
		<a href="/signup" class="text-[color:var(--color-accent-2)] hover:underline ml-1">Sign up</a>
	</p>
</section>