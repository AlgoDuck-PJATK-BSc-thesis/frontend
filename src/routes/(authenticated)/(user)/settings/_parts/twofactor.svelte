<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import SettingsCard from '../_cards/SettingsCard.svelte';
	import { authApi } from '$lib/api/auth';
	import { profileApi } from '$lib/api/profile';
	import type { Notice } from '../utils';
	import { ensureBang, formatErrorMessage } from '../utils';

	let twoFactorEnabled = $state(false);
	let twoFactorChoice = $state<'enabled' | 'disabled'>('disabled');

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
		twoFactorEnabled = !!prof?.profile?.twoFactorEnabled;
		twoFactorChoice = twoFactorEnabled ? 'enabled' : 'disabled';
	};

	const save = async () => {
		saving = true;
		try {
			const wantEnabled = twoFactorChoice === 'enabled';
			if (wantEnabled !== twoFactorEnabled) {
				if (wantEnabled) {
					await authApi.enableTwoFactor(fetch);
				} else {
					await authApi.disableTwoFactor(fetch);
				}
			}
			await refresh();
			setNotice('success', 'Saved');
		} catch (e) {
			setNotice('error', formatErrorMessage(e, 'Could not update 2FA'));
		} finally {
			saving = false;
		}
	};

	onMount(() => {
		void refresh();
	});
</script>

<SettingsCard
	id="twofactor"
	title="Two-factor authentication"
	className="bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))]"
>
	<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
		Two-factor authentication is currently {twoFactorEnabled ? 'enabled' : 'disabled'}.
	</p>

	<div
		class="flex items-center justify-between gap-4 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
	>
		<span>Status</span>
		<div class="flex items-center gap-6">
			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="radio"
					name="twofactor"
					value="enabled"
					bind:group={twoFactorChoice}
					class="peer hidden"
				/>
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
				></div>
				On
			</label>
			<label class="flex cursor-pointer items-center gap-2">
				<input
					type="radio"
					name="twofactor"
					value="disabled"
					bind:group={twoFactorChoice}
					class="peer hidden"
				/>
				<div
					class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
				></div>
				Off
			</label>
		</div>
	</div>

	<div class="mt-6">
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
