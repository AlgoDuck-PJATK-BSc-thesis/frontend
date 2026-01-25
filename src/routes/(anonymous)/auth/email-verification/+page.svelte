<script lang="ts">
	import { onMount } from 'svelte';
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';

	let status: 'pending' | 'success' | 'error' = $state('pending');

	function getParam(name: string) {
		const params = new URLSearchParams(window.location.search);
		return params.get(name) ?? '';
	}

	const userId = $derived(getParam('userId'));
	const token = $derived(() => {
		let t = getParam('token');
		return t.replaceAll(' ', '+');
	});
	const returnUrl = $derived(getParam('returnUrl') ?? '/home');

	onMount(async () => {
		if (!userId || !token) {
			status = 'error';
			return;
		}

		try {
			const res = await fetch('/api/auth/email-verification', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, token })
			});

			if (res.ok) {
				status = 'success';
				window.location.href = returnUrl;
			} else {
				status = 'error';
			}
		} catch {
			status = 'error';
		}
	});
</script>

<svelte:head>
	<title>Verifying Email - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-140 text-center">
		{#if status === 'pending'}
			<h1
				class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
			>
				Verifying email...
			</h1>

			<div
				class="relative z-10 mx-auto flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
			>
				<p class="text-center text-2xl font-semibold">Please wait while we verify your email</p>
				<p class="mt-4 text-sm opacity-80">Loading...</p>
			</div>
		{:else if status === 'success'}
			<h1
				class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
			>
				Email verified!
			</h1>

			<div
				class="relative z-10 mx-auto flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
			>
				<p class="text-center text-2xl font-semibold">Redirecting to AlgoDuck...</p>
			</div>
		{:else}
			<h1
				class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
			>
				Verification failed
			</h1>

			<div
				class="relative z-10 mx-auto flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
			>
				<p class="text-center text-2xl font-semibold">The link is invalid or expired.</p>
				<div class="mt-8 flex items-center gap-4">
					<a
						href="/login"
						class="cursor-pointer rounded border-2 border-white/10 bg-white/80 px-4 py-2 text-black hover:bg-white"
					>
						Go to Login
					</a>
				</div>
			</div>
		{/if}
	</div>
</section>
