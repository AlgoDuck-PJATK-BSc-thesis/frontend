<script lang="ts">
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import SettingsCard from '../_cards/SettingsCard.svelte';
	import BlinkingEye from '$lib/Components/Misc/BlinkingEye.svelte';
	import { settingsApi } from '$lib/api/settings';
	import type { Notice } from '../utils';
	import { ensureBang, formatErrorMessage } from '../utils';

	let currentPassword = $state('');
	let nextPassword = $state('');
	let nextPasswordConfirm = $state('');

	let showCurrentPassword = $state(false);
	let showNextPassword = $state(false);
	let showNextPasswordConfirm = $state(false);

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

	const save = async () => {
		if (!currentPassword || !nextPassword || !nextPasswordConfirm) {
			setNotice('error', 'Fill all password fields');
			return;
		}
		if (nextPassword !== nextPasswordConfirm) {
			setNotice('error', 'Passwords do not match');
			return;
		}

		saving = true;
		try {
			await settingsApi.changePassword({ currentPassword, newPassword: nextPassword }, fetch);
			currentPassword = '';
			nextPassword = '';
			nextPasswordConfirm = '';
			showCurrentPassword = false;
			showNextPassword = false;
			showNextPasswordConfirm = false;
			setNotice('success', 'Saved');
		} catch (e) {
			setNotice('error', formatErrorMessage(e, 'Could not change password'));
		} finally {
			saving = false;
		}
	};
</script>

<SettingsCard
	id="security"
	title="Password"
	className="bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
		Change your password. Note that if you signed in with external provider like Google, GitHub or
		Microsoft your password may be managed by that provider.
	</p>

	<div class="grid gap-4">
		<label
			class="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
		>
			<span>Current password</span>
			<div class="mt-2 flex items-center gap-2">
				<input
					type={showCurrentPassword ? 'text' : 'password'}
					bind:value={currentPassword}
					class="font-body w-full flex-1 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
				/>
				<button
					type="button"
					class="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] text-[color:var(--color-landingpage-subtitle)] hover:brightness-110"
					aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
					onclick={() => {
						showCurrentPassword = !showCurrentPassword;
					}}
				>
					<BlinkingEye open={showCurrentPassword} options={{ class: 'h-5 w-5' }} />
				</button>
			</div>
		</label>

		<label
			class="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
		>
			<span>New password</span>
			<div class="mt-2 flex items-center gap-2">
				<input
					type={showNextPassword ? 'text' : 'password'}
					bind:value={nextPassword}
					class="font-body w-full flex-1 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
				/>
				<button
					type="button"
					class="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] text-[color:var(--color-landingpage-subtitle)] hover:brightness-110"
					aria-label={showNextPassword ? 'Hide password' : 'Show password'}
					onclick={() => {
						showNextPassword = !showNextPassword;
					}}
				>
					<BlinkingEye open={showNextPassword} options={{ class: 'h-5 w-5' }} />
				</button>
			</div>
		</label>

		<label
			class="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
		>
			<span>Confirm new password</span>
			<div class="mt-2 flex items-center gap-2">
				<input
					type={showNextPasswordConfirm ? 'text' : 'password'}
					bind:value={nextPasswordConfirm}
					class="font-body w-full flex-1 rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
				/>
				<button
					type="button"
					class="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] text-[color:var(--color-landingpage-subtitle)] hover:brightness-110"
					aria-label={showNextPasswordConfirm ? 'Hide password' : 'Show password'}
					onclick={() => {
						showNextPasswordConfirm = !showNextPasswordConfirm;
					}}
				>
					<BlinkingEye open={showNextPasswordConfirm} options={{ class: 'h-5 w-5' }} />
				</button>
			</div>
		</label>

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
				class={`mt-1 text-sm font-semibold ${
					notice.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'
				}`}
			>
				{notice.message}
			</p>
		{/if}
	</div>
</SettingsCard>
