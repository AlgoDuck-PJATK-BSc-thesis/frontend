<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authApi } from '$lib/api/auth';
	import { redirectToOAuth } from '$lib/api/oauth';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';
	import BlinkingEye from '$lib/Components/Misc/BlinkingEye.svelte';

	let userNameOrEmail = $state('');
	let password = $state('');
	let error = $state<string | null>(null);

	let showPassword = $state(false);

	let showForgot = $state(false);
	let resetEmail = $state('');
	let resetInfo = $state<string | null>(null);
	let resetError = $state<string | null>(null);
	let resetLoading = $state(false);

	let externalLoading = $state<string | null>(null);
	let externalError = $state<string | null>(null);

	let oauthError = $derived(page.url.searchParams.get('oauthError'));
	let oauthProvider = $derived(page.url.searchParams.get('provider'));

	$effect(() => {
		if (oauthError) {
			externalError = `OAuth${oauthProvider ? ` (${oauthProvider})` : ''} failed. Please try again.`;
		}
	});

	const getSafeNext = () => {
		const next = page.url.searchParams.get('next');
		return next && next.startsWith('/') ? next : '/home';
	};

	const login = async () => {
		error = null;
		try {
			const res = await authApi.login({ userNameOrEmail, password }, fetch);

			if (res.twoFactorRequired) {
				const next = getSafeNext();
				await goto(
					`/auth/twofactor?challengeId=${encodeURIComponent(res.challengeId)}&next=${encodeURIComponent(next)}`
				);
				return;
			}

			await goto(getSafeNext());
		} catch (e) {
			error = e instanceof Error ? e.message : 'Login failed.';
		}
	};

	const requestReset = async () => {
		resetInfo = null;
		resetError = null;

		if (!resetEmail.trim()) {
			resetError = 'Please enter your email.';
			return;
		}

		resetLoading = true;
		try {
			const res = await authApi.requestPasswordReset({ email: resetEmail.trim() }, fetch);
			resetInfo = res.message;
		} catch (e) {
			resetError = e instanceof Error ? e.message : 'Failed to request password reset.';
		} finally {
			resetLoading = false;
		}
	};

	const startOAuth = (provider: 'google' | 'github' | 'microsoft') => {
		externalError = null;
		externalLoading = provider;

		const next = getSafeNext();
		const errorUrl = `/login?next=${encodeURIComponent(next)}`;

		try {
			redirectToOAuth(
				provider,
				next,
				errorUrl,
				provider === 'microsoft' ? { prompt: 'select_account' } : undefined
			);
		} catch (e) {
			externalLoading = null;
			externalError = e instanceof Error ? e.message : 'OAuth start failed.';
		}
	};
</script>

<svelte:head>
	<title>Log in - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-100 text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Log In
		</h1>

		<div
			class="relative z-10 flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-left text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
		>
			<form
				class="mt-2 flex w-70 flex-col gap-2 text-left text-sm text-[color:var(--color-input-text)]"
				onsubmit={(e) => e.preventDefault()}
			>
				<label class="flex flex-col">
					<span>Username or Email</span>
					<input
						type="text"
						required
						class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
						bind:value={userNameOrEmail}
					/>
				</label>

				<label class="flex flex-col">
					<span>Password</span>
					<div class="relative mt-2">
						<input
							type={showPassword ? 'text' : 'password'}
							required
							class="font-body w-full rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 pr-16 text-black"
							bind:value={password}
						/>
						<button
							type="button"
							class="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded border border-black/10 bg-white/80 text-black hover:bg-white"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							onclick={() => {
								showPassword = !showPassword;
							}}
						>
							<BlinkingEye open={showPassword} options={{ class: 'h-5 w-5' }} />
						</button>
					</div>
				</label>

				<div class="mt-2 flex items-center justify-between">
					<button
						type="button"
						onclick={() => {
							showForgot = !showForgot;
							resetInfo = null;
							resetError = null;
						}}
						class="cursor-pointer border-0 bg-transparent p-0 text-sm underline opacity-90 hover:opacity-100"
					>
						Forgot password?
					</button>
				</div>

				{#if showForgot}
					<div class="mt-3 flex flex-col gap-2 rounded border border-white/10 p-3">
						<label class="flex flex-col">
							<span>Email</span>
							<input
								type="email"
								class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
								bind:value={resetEmail}
								placeholder="you@example.com"
							/>
						</label>

						<div class="mt-2 flex items-center gap-3">
							<button
								type="button"
								disabled={resetLoading}
								onclick={requestReset}
								class="cursor-pointer rounded border-2 border-white/10 bg-white/80 px-3 py-2 text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
							>
								{#if resetLoading}
									Sending...
								{:else}
									Send reset link
								{/if}
							</button>

							<button
								type="button"
								onclick={() => {
									showForgot = false;
									resetInfo = null;
									resetError = null;
								}}
								class="cursor-pointer border-0 bg-transparent p-0 text-sm underline opacity-80 hover:opacity-100"
							>
								Cancel
							</button>
						</div>

						{#if resetInfo}
							<p class="mt-2 text-sm text-green-200">{resetInfo}</p>
						{/if}
						{#if resetError}
							<p class="mt-2 text-sm text-red-300">{resetError}</p>
						{/if}
					</div>
				{/if}

				{#if error}
					<p class="mt-3 text-sm text-red-300">{error}</p>
				{/if}
			</form>

			<div class="mt-8 mb-2 flex justify-center">
				<Button
					size="medium"
					label="→"
					labelFontFamily="var(--font-ariw9500)"
					labelColor="rgba(0,0,0,0.7)"
					labelFontSize="2rem"
					labelFontWeight="normal"
					labelTracking="extra"
					labelClass=""
					onclick={login}
				/>
			</div>

			{#if externalError}
				<p class="mt-4 text-sm text-red-300">{externalError}</p>
			{/if}

			<div class="mt-8 flex flex-col items-center gap-3">
				<div class="flex items-center justify-center gap-4">
					<button
						type="button"
						disabled={externalLoading !== null}
						onclick={() => startOAuth('google')}
						class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/90 shadow-md hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						<img
							src="/oauth/google.png"
							alt="Continue with Google"
							class="h-12 w-12 object-contain"
						/>
					</button>

					<button
						type="button"
						disabled={externalLoading !== null}
						onclick={() => startOAuth('github')}
						class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/90 shadow-md hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						<img
							src="/oauth/github.png"
							alt="Continue with GitHub"
							class="h-12 w-12 object-contain"
						/>
					</button>

					<button
						type="button"
						disabled={externalLoading !== null}
						onclick={() => startOAuth('microsoft')}
						class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/90 shadow-md hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						<img
							src="/oauth/microsoft.png"
							alt="Continue with Microsoft"
							class="h-12 w-12 object-contain"
						/>
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
