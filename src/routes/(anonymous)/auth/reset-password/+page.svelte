<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authApi } from '$lib/api/auth';
	import BlinkingEye from '$lib/Components/Misc/BlinkingEye.svelte';
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';

	const normalizeTokenFromQuery = (raw: string) => {
		const t = (raw ?? '').toString().trim();
		if (!t) return '';
		return t.replaceAll(' ', '+');
	};

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let error = $state<string | null>(null);
	let info = $state<string | null>(null);
	let loading = $state(false);

	const userId = $derived((page.url.searchParams.get('userId') ?? '').trim());
	const token = $derived(normalizeTokenFromQuery(page.url.searchParams.get('token') ?? ''));

	const reset = async () => {
		error = null;
		info = null;

		if (!userId || !token) {
			error = 'Invalid or missing reset link.';
			return;
		}

		if (!password || !confirmPassword) {
			error = 'Please enter and confirm your new password.';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		loading = true;
		try {
			const res = await authApi.resetPassword({ userId, token, password, confirmPassword }, fetch);
			info = res.message;
			await goto('/login');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Password reset failed.';
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Reset password - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />
	<div class="relative z-20 mx-auto mt-16 max-w-100 text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Reset Password
		</h1>

		<div
			class="relative z-10 flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-left text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
		>
			{#if !userId || !token}
				<p class="text-sm text-red-300">Invalid or missing reset link.</p>
				<p class="mt-4">
					<a href="/login" class="underline">Back to login</a>
				</p>
			{:else}
				<form
					class="mt-0 flex w-70 flex-col gap-2 text-left text-sm text-[color:var(--color-input-text)]"
					onsubmit={(e) => e.preventDefault()}
				>
					<label class="flex flex-col">
						<span>New password</span>
						<div class="mt-2 flex items-center gap-2">
							<input
								type={showPassword ? 'text' : 'password'}
								required
								class="font-body flex-1 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
								bind:value={password}
							/>
							<button
								type="button"
								class="flex h-11 w-11 items-center justify-center rounded border-2 border-[color:var(--color-accent-1)] bg-white text-black hover:bg-white/90"
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
						<span>Confirm new password</span>
						<div class="mt-2 flex items-center gap-2">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								required
								class="font-body flex-1 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-black"
								bind:value={confirmPassword}
							/>
							<button
								type="button"
								class="flex h-11 w-11 items-center justify-center rounded border-2 border-[color:var(--color-accent-1)] bg-white text-black hover:bg-white/90"
								aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
								onclick={() => {
									showConfirmPassword = !showConfirmPassword;
								}}
							>
								<BlinkingEye open={showConfirmPassword} options={{ class: 'h-5 w-5' }} />
							</button>
						</div>
					</label>

					<div class="mt-4 flex items-center gap-3">
						<button
							type="button"
							disabled={loading}
							onclick={reset}
							class="cursor-pointer rounded border-2 border-white/10 bg-white/80 px-4 py-2 text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
						>
							{#if loading}
								Resetting...
							{:else}
								Reset password
							{/if}
						</button>

						<a href="/login" class="text-sm underline opacity-90 hover:opacity-100">Cancel</a>
					</div>

					{#if info}
						<p class="mt-3 text-sm text-green-200">{info}</p>
					{/if}
					{#if error}
						<p class="mt-3 text-sm text-red-300">{error}</p>
					{/if}
				</form>
			{/if}
		</div>
	</div>
</section>
