<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { authApi } from '$lib/api/auth';
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';

	type Status = 'pending' | 'success';

	const normalizeTokenFromQuery = (raw: string) => {
		const t = (raw ?? '').toString().trim();
		if (!t) return '';
		return t.replaceAll(' ', '+');
	};

	let status = $state<Status>('pending');
	let email = $state<string | null>(null);
	let returnUrl = $state('/home');
	let shouldRedirect = $state(false);
	let redirectingToLogin = $state(false);

	const readParam = (name: string) => {
		const fromPage = (page.url.searchParams.get(name) ?? '').toString().trim();
		if (fromPage) return fromPage;

		if (typeof window === 'undefined') return '';

		const params = new URLSearchParams(window.location.search);
		return (params.get(name) ?? '').toString().trim();
	};

	const redirectToLogin = () => {
		if (typeof window === 'undefined') return;
		redirectingToLogin = true;
		const next = returnUrl || '/home';
		const url = `/login?returnUrl=${encodeURIComponent(next)}`;
		window.location.href = url;
	};

	onMount(async () => {
		const userId = readParam('userId');
		const token = normalizeTokenFromQuery(readParam('token'));
		const rawReturnUrl = readParam('returnUrl');

		returnUrl = rawReturnUrl || '/home';
		shouldRedirect = !!rawReturnUrl;

		if (!userId || !token) {
			redirectToLogin();
			return;
		}

		status = 'pending';

		try {
			const u = await authApi.userByToken({ userId, token }, fetch);
			email = u.email ?? null;
			status = 'success';

			if (shouldRedirect && typeof window !== 'undefined') {
				window.location.href = returnUrl;
			}
			return;
		} catch {
			email = null;
		}

		try {
			const res = await fetch('/api/auth/email-verification', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, token })
			});

			if (!res.ok) {
				redirectToLogin();
				return;
			}

			status = 'success';

			if (typeof window !== 'undefined') {
				window.location.href = returnUrl;
			}
		} catch {
			redirectToLogin();
		}
	});
</script>

<svelte:head>
	<title>{status === 'pending' ? 'Verifying Email - AlgoDuck' : 'Email verified - AlgoDuck'}</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-140 text-center">
		{#if status === 'pending'}
			<h1
				class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
			>
				{redirectingToLogin ? 'Redirecting...' : 'Verifying email...'}
			</h1>

			<div
				class="relative z-10 mx-auto flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
			>
				{#if redirectingToLogin}
					<p class="text-center text-2xl font-semibold">Taking you to login</p>
					<p class="mt-4 text-sm opacity-80">Loading...</p>
				{:else}
					<p class="text-center text-2xl font-semibold">Please wait while we verify your email</p>
					<p class="mt-4 text-sm opacity-80">Loading...</p>
				{/if}
			</div>
		{:else}
			<h1
				class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
			>
				Welcome aboard{#if email}
					{email}!{:else}!{/if}
			</h1>

			<div
				class="relative z-10 mx-auto flex w-full flex-col items-center rounded-3xl border border-white/10 p-10 px-14 py-12 pt-10 pb-14 text-[var(--color-text-box)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-3xl"
			>
				<p class="text-center text-2xl font-semibold">Your email is now verified at AlgoDuck</p>

				{#if shouldRedirect}
					<p class="mt-4 text-sm opacity-80">Redirecting...</p>
				{/if}

				<div class="mt-8 flex items-center gap-4">
					<a
						href={returnUrl}
						class="cursor-pointer rounded border-2 border-white/10 bg-white/80 px-4 py-2 text-black hover:bg-white"
					>
						Continue
					</a>
				</div>
			</div>
		{/if}
	</div>
</section>
