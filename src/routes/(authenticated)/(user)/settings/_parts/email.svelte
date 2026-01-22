<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import SettingsCard from '../_cards/SettingsCard.svelte';
	import type { UserConfigDto } from '$lib/api/settings';
	import { authApi } from '$lib/api/auth';
	import { profileApi } from '$lib/api/profile';
	import type { Notice } from '../utils';
	import { coerceString, ensureBang, formatErrorMessage } from '../utils';

	let { config = null } = $props<{ config?: UserConfigDto | null }>();

	let email = $state(coerceString(config?.email).trim());
	let newEmail = $state('');
	let saving = $state(false);
	let notice = $state<Notice | null>(null);
	let timer: ReturnType<typeof setTimeout> | null = null;

	const setNotice = (type: Notice['type'], message: string) => {
		notice = { type, message: ensureBang(message) };
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			notice = null;
		}, 3000);
	};

	const refresh = async () => {
		const prof = await profileApi.getProfile(fetch);
		const e = coerceString(prof?.profile?.email).trim();
		if (e) email = e;
	};

	const send = async () => {
		const clean = newEmail.trim();
		if (!clean) {
			setNotice('error', 'Enter a new email');
			return;
		}

		saving = true;
		try {
			await authApi.changeEmailStart({ newEmail: clean }, fetch);
			setNotice('success', 'Verification email sent');
			newEmail = '';
		} catch (e) {
			setNotice('error', formatErrorMessage(e, 'Could not send verification email'));
		} finally {
			saving = false;
		}
	};

	onMount(() => {
		void refresh();
	});
</script>

<SettingsCard
	id="email"
	title="Email"
	className="bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))]"
>
	<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
		Change your email address. You will receive a verification email.
	</p>

	<div class="text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]">
		<p class="opacity-70">Current email</p>
		<p class="mt-1 break-all">{email}</p>
	</div>

	<label
		class="mt-4 flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
	>
		<span>New email</span>
		<input
			bind:value={newEmail}
			class="font-body w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
		/>
	</label>

	<div class="mt-4">
		<div class={saving ? 'pointer-events-none opacity-60' : ''}>
			<Button
				size="bigger"
				label={saving ? 'Sending' : 'Send verification'}
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="1.2rem"
				labelFontWeight="normal"
				labelTracking="normal"
				labelClass=""
				onclick={send}
			/>
		</div>

		{#if notice}
			<p
				class={`mt-3 text-sm font-semibold ${
					notice.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'
				}`}
			>
				{notice.message}
			</p>
		{/if}
	</div>
</SettingsCard>
