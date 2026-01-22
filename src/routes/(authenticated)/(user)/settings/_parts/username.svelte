<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import SettingsCard from '../_cards/SettingsCard.svelte';
	import type { UserConfigDto } from '$lib/api/settings';
	import { settingsApi } from '$lib/api/settings';
	import { profileApi } from '$lib/api/profile';
	import type { Notice } from '../utils';
	import { coerceString, ensureBang, formatErrorMessage } from '../utils';

	let { config = null } = $props<{ config?: UserConfigDto | null }>();

	let newUsername = $state(coerceString(config?.username).trim());
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
		const u = coerceString(prof?.profile?.username).trim();
		if (u) newUsername = u;
	};

	const save = async () => {
		const clean = newUsername.trim();
		if (!clean) {
			setNotice('error', 'Username cannot be empty');
			return;
		}

		saving = true;
		try {
			await settingsApi.updateUsername({ newUserName: clean }, fetch);
			try {
				await refresh();
			} catch {}
			setNotice('success', 'Saved');
		} catch (e) {
			setNotice('error', formatErrorMessage(e, 'Could not save username'));
		} finally {
			saving = false;
		}
	};

	onMount(() => {
		void refresh();
	});
</script>

<SettingsCard
	id="username"
	title="Username"
	className="mt-5 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
		Change your username.
	</p>

	<label
		class="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
	>
		<span>Username</span>
		<input
			bind:value={newUsername}
			class="font-body w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
		/>
	</label>

	<div class="mt-4">
		<div class={saving ? 'pointer-events-none opacity-60' : ''}>
			<Button
				size="small"
				label={saving ? 'Saving' : 'Save'}
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="1.2rem"
				labelFontWeight="normal"
				labelTracking="normal"
				labelClass=""
				onclick={save}
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
