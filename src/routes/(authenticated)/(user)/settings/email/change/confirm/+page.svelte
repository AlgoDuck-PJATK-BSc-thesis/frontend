<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import { FetchJsonFromApi } from '$lib/api/apiCall';

	export let data: { userId: string; newEmail: string; token: string };

	let state: 'idle' | 'submitting' | 'success' | 'error' = 'idle';
	let message = '';

	const canSubmit = () => {
		return !!(data.userId && data.newEmail && data.token);
	};

	const confirmChange = async () => {
		if (!canSubmit()) {
			state = 'error';
			message = 'Missing parameters in the confirmation link.';
			return;
		}

		state = 'submitting';
		message = '';

		try {
			await FetchJsonFromApi(
				'auth/email/change/confirm',
				{
					method: 'POST',
					body: JSON.stringify({
						userId: data.userId,
						newEmail: data.newEmail,
						token: data.token
					})
				},
				fetch
			);

			state = 'success';
			message = 'Email change confirmed.';
		} catch (e) {
			state = 'error';
			message = e instanceof Error ? e.message : 'Email change failed.';
		}
	};

	onMount(() => {
		void confirmChange();
	});
</script>

<svelte:head>
	<title>Confirm email change - AlgoDuck</title>
</svelte:head>

<section class="mt-2 flex h-[calc(100vh-5rem)] justify-center overflow-hidden px-6 pt-7">
	<div class="flex h-full w-full max-w-2xl flex-col gap-5 overflow-y-auto pb-8">
		<div
			class="rounded-2xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] px-6 py-6"
		>
			<h2 class="mb-3 text-2xl font-bold text-[var(--color-landingpage-title)]">
				Confirm email change
			</h2>

			{#if state === 'submitting'}
				<p class="text-sm text-[color:var(--color-landingpage-subtitle)] opacity-80">
					Confirming your email change.
				</p>
			{:else if state === 'success'}
				<p class="text-sm text-[color:var(--color-landingpage-subtitle)] opacity-80">
					{message}
				</p>

				<div class="mt-6 flex gap-3">
					<Button
						size="small"
						label="Go to Settings"
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={() => goto('/settings')}
					/>
					<Button
						size="small"
						label="Home"
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={() => goto('/home')}
					/>
				</div>
			{:else if state === 'error'}
				<p class="text-sm text-[color:var(--color-landingpage-subtitle)] opacity-80">
					{message}
				</p>

				<div class="mt-6 flex gap-3">
					<Button
						size="small"
						label="Try again"
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={confirmChange}
					/>
					<Button
						size="small"
						label="Go to Settings"
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={() => goto('/settings')}
					/>
				</div>
			{:else}
				<p class="text-sm text-[color:var(--color-landingpage-subtitle)] opacity-80">
					Preparing confirmation.
				</p>
			{/if}
		</div>
	</div>
</section>
