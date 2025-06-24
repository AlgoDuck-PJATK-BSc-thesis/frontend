<svelte:head>
	<title>Sign up – Beetcode</title>
</svelte:head>

<section class="auth">
	<h1>Sign up</h1>

	<form method="POST" class="form">
		<label>
			<span>Username</span>
			<input type="text" name="username" required />
		</label>

		<label>
			<span>Email</span>
			<input type="email" name="email" required />
		</label>

		<label>
			<span>Password</span>
			<input type="password" name="password" required />
		</label>

		<button type="submit">Create account</button>
	</form>

	<p class="switch">
		Already have an account?&nbsp;<a href="/login">Log in</a>
	</p>
</section>

<style>
	.auth {
		max-width: 400px;
		margin: 5rem auto;
		padding: 0 1rem;
		text-align: center;
	}

	h1 {
		font-size: 1.5rem;
		margin-bottom: 2rem;
		color: var(--color-primary);
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		text-align: left;
		font-size: 0.85rem;
		color: var(--color-text);
	}

	input {
		margin-top: 0.4rem;
		padding: 0.6rem;
		border: 2px solid var(--color-accent-1);
		border-radius: 4px;
		background: white;
		color: black;
		font-family: var(--font-body);
	}

	button {
		background: var(--color-primary);
		color: black;
		padding: 0.6rem 1.4rem;
		border: none;
		cursor: pointer;
		font-family: var(--font-body);
		transition: transform 0.2s ease;
	}

	button:hover {
		transform: translateY(-2px);
	}

	.switch {
		margin-top: 1.5rem;
		font-size: 0.68rem;
		line-height: 1.3;
		word-break: keep-all;
		white-space: normal;
		text-align: center;
	}

	a {
		color: var(--color-accent-2);
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
