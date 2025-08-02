<svelte:head>
	<title>Sign up – Beetcode</title>
</svelte:head>

<section class="max-w-md mx-auto mt-20 px-4 text-center">
	<h1 class="text-xl mb-8 text-[color:var(--color-primary)]">Sign up</h1>

	<form method="POST" class="flex flex-col gap-4">
		<label class="flex flex-col text-left text-sm text-[color:var(--color-text)]">
			<span>Username</span>
			<input
				type="text"
				name="username"
				required
				class="mt-2 p-2.5 border-2 border-[color:var(--color-accent-1)] rounded bg-white text-black font-body"
			/>
		</label>

		<label class="flex flex-col text-left text-sm text-[color:var(--color-text)]">
			<span>Email</span>
			<input
				type="email"
				name="email"
				required
				class="mt-2 p-2.5 border-2 border-[color:var(--color-accent-1)] rounded bg-white text-black font-body"
			/>
		</label>

		<label class="flex flex-col text-left text-sm text-[color:var(--color-text)]">
			<span>Password</span>
			<input
				type="password"
				name="password"
				required
				class="mt-2 p-2.5 border-2 border-[color:var(--color-accent-1)] rounded bg-white text-black font-body"
			/>
		</label>

		<button
		type="submit"
		class="bg-[var(--color-primary)] text-[var(--color-bg)] px-6 py-2.5 font-body transition-transform hover:-translate-y-0.5"
		>
		Create account
		</button>

	</form>

	<p class="mt-6 text-xs leading-snug text-center">
		<span>Already have an account?</span>
		<a href="/login" class="text-[color:var(--color-accent-2)] hover:underline ml-1">Log in</a>
	</p>
</section>