<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authApi } from '$lib/api/auth';
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import { redirectToOAuth } from '$lib/api/oauth';
	import BlinkingEye from '$lib/Components/Misc/BlinkingEye.svelte';
	import Arrow from '$lib/Components/Misc/Arrow.svelte';

	let userName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state<string | null>(null);

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

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

	const signup = async () => {
		error = null;
		try {
			await authApi.register({ userName, email, password, confirmPassword }, fetch);
			await goto('/login');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Signup failed.';
		}
	};

	const startOAuth = (provider: 'google' | 'github' | 'microsoft') => {
		externalError = null;
		externalLoading = provider;

		const next = getSafeNext();
		const errorUrl = `/signup?next=${encodeURIComponent(next)}`;

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
	<title>Sign up - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-100 text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Sign Up
		</h1>

		<div
			class="relative z-10 flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-left text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
		>
			<form
				class="mt-2 flex w-70 flex-col gap-2 text-left text-sm text-[color:var(--color-input-text)]"
				onsubmit={(e) => e.preventDefault()}
			>
				<label class="flex flex-col">
					<span>Username</span>
					<input
						type="text"
						required
						class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
						bind:value={userName}
					/>
				</label>

				<label class="flex flex-col">
					<span>Email</span>
					<input
						type="email"
						required
						class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
						bind:value={email}
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

				<label class="flex flex-col">
					<span>Confirm password</span>
					<div class="relative mt-2">
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							required
							class="font-body w-full rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 pr-16 text-black"
							bind:value={confirmPassword}
						/>
						<button
							type="button"
							class="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded border border-black/10 bg-white/80 text-black hover:bg-white"
							aria-label={showConfirmPassword
								? 'Hide password confirmation'
								: 'Show password confirmation'}
							onclick={() => {
								showConfirmPassword = !showConfirmPassword;
							}}
						>
							<BlinkingEye open={showConfirmPassword} options={{ class: 'h-5 w-5' }} />
						</button>
					</div>
				</label>

				{#if error}
					<p class="mt-3 text-sm text-red-300">{error}</p>
				{/if}
			</form>

			<div class="mt-8 mb-2 flex justify-center">
				<div class="group relative inline-block">
					<Button
						size="medium"
						label={'\u00A0'}
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="2rem"
						labelFontWeight="normal"
						labelTracking="extra"
						labelClass=""
						onclick={signup}
					/>
					<span class="pointer-events-none absolute inset-0 flex items-center justify-center">
						<span
							class="translate-y-[-4px] transition-transform duration-100 group-hover:translate-y-0"
						>
							<Arrow size={32} stroke="rgba(0,0,0,0.7)" />
						</span>
					</span>
				</div>
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
