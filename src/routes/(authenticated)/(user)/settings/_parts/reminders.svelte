<script lang="ts">
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import WeeklyPicker from '$lib/Components/DurationPickers/WeeklyPicker.svelte';
	import SettingsCard from '../_cards/SettingsCard.svelte';
	import type { WeeklyReminderConfig } from '$lib/types/StudyTimerTypes';
	import type { Notice } from '../utils';

	let {
		reminders,
		emailNotificationsEnabled,
		hasAnyReminderEnabled,
		savingReminders = false,
		noticeReminders = null,
		onToggle,
		onChange,
		onSave
	} = $props<{
		reminders: WeeklyReminderConfig;
		emailNotificationsEnabled: boolean;
		hasAnyReminderEnabled: boolean;
		savingReminders?: boolean;
		noticeReminders?: Notice | null;
		onToggle: (v: boolean) => void;
		onChange: (v: WeeklyReminderConfig) => void;
		onSave: () => void;
	}>();
</script>

<SettingsCard
	id="reminder"
	title="Study reminders"
	className="border-2 border-[color:var(--color-accent-4)] bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))]"
>
	<p class="mt-2 mb-8 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
		Choose on which days and at what hour you want a reminder email.
	</p>

	<div
		class="mb-4 flex items-center justify-between gap-4 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
	>
		<span>Email reminders</span>
		<input
			type="checkbox"
			checked={emailNotificationsEnabled}
			class="h-5 w-5 cursor-pointer appearance-none rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)]"
			style:background-color={emailNotificationsEnabled
				? 'var(--color-primary)'
				: 'var(--color-accent-3)'}
			onchange={(e: Event) => {
				onToggle((e.currentTarget as HTMLInputElement).checked);
			}}
		/>
	</div>

	<div class={emailNotificationsEnabled ? '' : 'pointer-events-none opacity-50'}>
		<WeeklyPicker
			value={reminders}
			onChange={(v) => {
				onChange(v);
			}}
		/>

		{#if emailNotificationsEnabled && !hasAnyReminderEnabled}
			<p class="mt-4 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Default: every two weeks on Monday at 08:00.
			</p>
		{/if}
	</div>

	<div class="mt-6 flex justify-start">
		<div class={savingReminders ? 'pointer-events-none opacity-60' : ''}>
			<Button
				size="small"
				label={savingReminders ? 'Saving' : 'Save'}
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="1.2rem"
				labelFontWeight="normal"
				labelTracking="normal"
				labelClass=""
				onclick={onSave}
			/>
		</div>
	</div>

	{#if noticeReminders}
		<p
			class={`mt-3 text-sm font-semibold ${
				noticeReminders.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'
			}`}
		>
			{noticeReminders.message}
		</p>
	{/if}
</SettingsCard>
