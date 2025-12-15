<script lang="ts">
	import { goto } from '$app/navigation';
	import { API_URL } from '$lib/api/apiCall';
	import { authApi } from '$lib/api/auth';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import LandingPage from '$lib/Components/LandingPage.svelte';

	let userName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state<string | null>(null);

	const register = async () => {
		error = null;

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		await authApi.register({ userName, email, password, confirmPassword }, fetch);

		const loginRes = await authApi.login(
			{ userNameOrEmail: userName, password, rememberMe: false },
			fetch
		);

		if (loginRes.twoFactorRequired) {
			error = 'Two-factor authentication required (not wired yet).';
			return;
		}

		await goto('/home');
	};

	const oauthUrl = (provider: string) => `${API_URL}/auth/oauth/${provider}`;
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
			<form class="mt-0 flex w-70 flex-col gap-2" onsubmit={(e) => e.preventDefault()}>
				<label class="flex flex-col text-left text-sm text-[color:var(--color-input-text)]">
					<span>Username</span>
					<input
						type="text"
						required
						class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
						bind:value={userName}
					/>
				</label>

				<label class="flex flex-col text-left text-sm text-[color:var(--color-input-text)]">
					<span>Email</span>
					<input
						type="email"
						required
						class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
						bind:value={email}
					/>
				</label>

				<label class="flex flex-col text-left text-sm text-[color:var(--color-input-text)]">
					<span>Password</span>
					<input
						type="password"
						required
						class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
						bind:value={password}
					/>
				</label>

				<label class="flex flex-col text-left text-sm text-[color:var(--color-input-text)]">
					<span>Confirm Password</span>
					<input
						type="password"
						required
						class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
						bind:value={confirmPassword}
					/>
				</label>

				{#if error}
					<p class="mt-3 text-sm text-red-300">{error}</p>
				{/if}
			</form>

			<p class="mt-6 text-center leading-snug">
				<a
					href="/login"
					class="inline-flex text-[color:var(--color-input-text)] hover:text-[color:var(--color-header-guest)]"
				>
					<span>Already have an account?</span>
					<span class="ml-1 font-semibold">Log In</span>
				</a>
			</p>

			<div class="mt-6 mb-0 flex justify-center">
				<Button
					size="medium"
					label="→"
					labelFontFamily="var(--font-ariw9500)"
					labelColor="rgba(0,0,0,0.7)"
					labelFontSize="2rem"
					labelFontWeight="normal"
					labelTracking="extra"
					labelClass=""
					onclick={register}
				/>
			</div>

			<div class="mt-8 flex flex-col items-center gap-3">
				<div class="flex items-center justify-center gap-4">
					<a
						href={oauthUrl('google')}
						class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/100 shadow-md hover:bg-white/70"
					>
						<img
							src="/oauth/google.png"
							alt="Sign up with Google"
							class="h-12 w-12 object-contain"
						/>
					</a>

					<a
						href={oauthUrl('github')}
						class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/100 shadow-md hover:bg-white/70"
					>
						<img
							src="/oauth/github.png"
							alt="Sign up with GitHub"
							class="h-12 w-12 object-contain"
						/>
					</a>

					<a
						href={oauthUrl('facebook')}
						class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white/100 shadow-md hover:bg-white/70"
					>
						<img
							src="/oauth/facebook.png"
							alt="Sign up with Facebook"
							class="h-12 w-12 object-contain"
						/>
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
