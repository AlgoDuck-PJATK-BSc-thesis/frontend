<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authApi } from '$lib/api/auth';
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';

	let code = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	const challengeId = $derived(page.url.searchParams.get('challengeId') ?? '');
	const next = $derived(() => {
		const n = page.url.searchParams.get('next');
		return n && n.startsWith('/') ? n : '/home';
	});

	const submit = async () => {
		error = null;

		if (!challengeId) {
			error = 'Missing challenge id.';
			return;
		}

		const trimmed = code.trim();
		if (trimmed.length !== 6) {
			error = 'Enter the 6-character code.';
			return;
		}

		loading = true;
		try {
			await authApi.verifyTwoFactorLogin({ challengeId, code: trimmed }, fetch);
			await goto(next());
		} catch (e) {
			error = e instanceof Error ? e.message : 'Two-factor verification failed.';
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Two-factor - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-100 text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Two-Factor
		</h1>

		<div
			class="relative z-10 flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-left text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
		>
			<form
				class="mt-0 flex w-70 flex-col gap-2 text-left text-sm text-[color:var(--color-input-text)]"
				onsubmit={(e) => e.preventDefault()}
			>
				<label class="flex flex-col">
					<span>6-character code</span>
					<input
						type="text"
						inputmode="numeric"
						autocomplete="one-time-code"
						maxlength="6"
						class="font-body mt-2 rounded border-2 border-[color:var(--color-accent-1)] bg-white p-2.5 text-center text-xl tracking-widest text-black"
						bind:value={code}
					/>
				</label>

				<div class="mt-4 flex items-center gap-3">
					<button
						type="button"
						disabled={loading}
						onclick={submit}
						class="cursor-pointer rounded border-2 border-white/10 bg-white/80 px-4 py-2 text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
					>
						{#if loading}
							Verifying...
						{:else}
							Verify
						{/if}
					</button>

					<a href="/login" class="text-sm underline opacity-90 hover:opacity-100">Back to login</a>
				</div>

				{#if error}
					<p class="mt-3 text-sm text-red-300">{error}</p>
				{/if}
			</form>
		</div>
	</div>
</section>
