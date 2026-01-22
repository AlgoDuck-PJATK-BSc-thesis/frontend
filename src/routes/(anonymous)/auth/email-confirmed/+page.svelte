<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { authApi } from '$lib/api/auth';
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';

	const normalizeTokenFromQuery = (raw: string) => {
		const t = (raw ?? '').toString().trim();
		if (!t) return '';
		return t.replaceAll(' ', '+');
	};

	let email = $state<string | null>(null);
	let loading = $state(false);

	const userId = $derived((page.url.searchParams.get('userId') ?? '').trim());
	const token = $derived(normalizeTokenFromQuery(page.url.searchParams.get('token') ?? ''));

	onMount(async () => {
		if (!userId || !token) return;

		loading = true;
		try {
			const u = await authApi.userByToken({ userId, token }, fetch);
			email = u.email;
		} catch {
			email = null;
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Email verified - AlgoDuck</title>
</svelte:head>

<section class="relative h-full w-full overflow-x-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-140 text-center">
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

			{#if loading}
				<p class="mt-4 text-sm opacity-80">Loading...</p>
			{/if}

			<div class="mt-8 flex items-center gap-4">
				<a
					href="/home"
					class="cursor-pointer rounded border-2 border-white/10 bg-white/80 px-4 py-2 text-black hover:bg-white"
				>
					Continue
				</a>
			</div>
		</div>
	</div>
</section>
