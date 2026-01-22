<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import SettingsCard from '../_cards/SettingsCard.svelte';
	import { authApi } from '$lib/api/auth';
	import { settingsApi } from '$lib/api/settings';
	import type { Notice } from '../utils';
	import { ensureBang, formatErrorMessage } from '../utils';

	const deletePhrase = 'I am sure I want to delete my account';

	let deleteConfirm = $state('');
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

	const deleteAccount = async () => {
		if (deleteConfirm.trim() !== deletePhrase) {
			setNotice('error', 'Type the confirmation text exactly');
			return;
		}

		const confirmed = confirm(
			'This will permanently delete your account. This action cannot be undone. Continue?'
		);
		if (!confirmed) return;

		saving = true;
		try {
			await settingsApi.deleteAccount({ confirmationText: deleteConfirm.trim() }, fetch);
			try {
				await authApi.logout(fetch);
			} catch {}
			await goto('/');
		} catch (e) {
			setNotice('error', formatErrorMessage(e, 'Could not delete account'));
		} finally {
			saving = false;
		}
	};
</script>

<SettingsCard
	id="danger"
	title="Danger zone"
	className="bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))]"
>
	<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
		Deleting your account is irreversible.
	</p>

	<p class="text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]">
		Type the following text to confirm:
	</p>
	<p class="mt-2 text-sm font-semibold break-all text-[color:var(--color-primary)]">
		{deletePhrase}
	</p>

	<input
		bind:value={deleteConfirm}
		class="font-body mt-4 w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
	/>

	<div class="mt-4">
		<div class={saving ? 'pointer-events-none opacity-60' : ''}>
			<Button
				size="bigger"
				label={saving ? 'Deleting' : 'Delete account'}
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="1.2rem"
				labelFontWeight="normal"
				labelTracking="normal"
				labelClass=""
				onclick={deleteAccount}
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
