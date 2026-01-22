<script lang="ts">
	import { onMount } from 'svelte';
	import type { WeeklyReminderConfig } from '$lib/types/StudyTimerTypes';
	import type { UserConfigDto } from '$lib/api/settings';
	import { userThemePreference } from '$lib/stores/theme.svelte';
	import { accessibility } from '$lib/stores/accessibility.svelte';
	import { setThemeWithContrast, type ThemeName } from '$lib/Themes';
	import type { Notice } from '../utils';
	import { coerceBool, ensureBang, formatErrorMessage } from '../utils';
	import { persistPreferences } from '../prefs';
	import Theme from './theme.svelte';
	import Reminders from './reminders.svelte';

	let { config = null } = $props<{ config?: UserConfigDto | null }>();

	let theme = $state<ThemeName>(
		config
			? coerceBool((config as any).isDarkMode, userThemePreference.theme === 'dark')
				? 'dark'
				: 'light'
			: (userThemePreference.theme as ThemeName)
	);

	let highContrast = $state(
		config
			? coerceBool((config as any).isHighContrast, accessibility.contrast === 1)
			: accessibility.contrast === 1
	);

	let highContrastChoice = $derived.by(
		() => (highContrast ? 'enabled' : 'disabled') as 'enabled' | 'disabled'
	);

	let emailNotificationsEnabled = $state(
		config ? coerceBool((config as any).emailNotificationsEnabled, false) : false
	);

	let reminders = $state<WeeklyReminderConfig>(
		(config?.weeklyReminders ?? []) as WeeklyReminderConfig
	);

	let savingTheme = $state(false);
	let savingContrast = $state(false);
	let savingReminders = $state(false);

	let noticeTheme = $state<Notice | null>(null);
	let noticeContrast = $state<Notice | null>(null);
	let noticeReminders = $state<Notice | null>(null);

	let timerTheme: ReturnType<typeof setTimeout> | null = null;
	let timerContrast: ReturnType<typeof setTimeout> | null = null;
	let timerReminders: ReturnType<typeof setTimeout> | null = null;

	const hasAnyReminderEnabled = () =>
		Array.isArray(reminders) && reminders.some((r: any) => !!r?.enabled);

	const currentContrastLevel = () => (highContrast ? '1' : '0');

	const applyLocalThemeContrast = () => {
		userThemePreference.theme = theme;
		accessibility.contrast = highContrast ? 1 : 0;
		setThemeWithContrast(theme, currentContrastLevel());
	};

	const setNotice = (
		which: 'theme' | 'contrast' | 'reminders',
		type: Notice['type'],
		message: string
	) => {
		const value = { type, message: ensureBang(message) };
		if (which === 'theme') {
			noticeTheme = value;
			if (timerTheme) clearTimeout(timerTheme);
			timerTheme = setTimeout(() => {
				noticeTheme = null;
			}, 3000);
		}
		if (which === 'contrast') {
			noticeContrast = value;
			if (timerContrast) clearTimeout(timerContrast);
			timerContrast = setTimeout(() => {
				noticeContrast = null;
			}, 3000);
		}
		if (which === 'reminders') {
			noticeReminders = value;
			if (timerReminders) clearTimeout(timerReminders);
			timerReminders = setTimeout(() => {
				noticeReminders = null;
			}, 3000);
		}
	};

	const setThemeValue = (t: ThemeName) => {
		theme = t;
		applyLocalThemeContrast();
	};

	const setHighContrastSelection = (choice: 'enabled' | 'disabled') => {
		highContrast = choice === 'enabled';
		applyLocalThemeContrast();
	};

	const saveTheme = async () => {
		savingTheme = true;
		try {
			await persistPreferences(fetch, theme, highContrast, emailNotificationsEnabled, reminders);
			applyLocalThemeContrast();
			setNotice('theme', 'success', 'Saved');
		} catch (e) {
			setNotice('theme', 'error', formatErrorMessage(e, 'Could not save theme'));
		} finally {
			savingTheme = false;
		}
	};

	const saveContrast = async () => {
		savingContrast = true;
		try {
			await persistPreferences(fetch, theme, highContrast, emailNotificationsEnabled, reminders);
			applyLocalThemeContrast();
			setNotice('contrast', 'success', 'Saved');
		} catch (e) {
			setNotice('contrast', 'error', formatErrorMessage(e, 'Could not save contrast'));
		} finally {
			savingContrast = false;
		}
	};

	const saveReminders = async () => {
		savingReminders = true;
		try {
			await persistPreferences(fetch, theme, highContrast, emailNotificationsEnabled, reminders);
			setNotice('reminders', 'success', 'Saved');
		} catch (e) {
			setNotice('reminders', 'error', formatErrorMessage(e, 'Could not save reminders'));
		} finally {
			savingReminders = false;
		}
	};

	onMount(() => {
		applyLocalThemeContrast();
	});
</script>

<Theme
	{theme}
	{highContrastChoice}
	{savingTheme}
	{savingContrast}
	{noticeTheme}
	{noticeContrast}
	onTheme={setThemeValue}
	onContrast={setHighContrastSelection}
	onSaveTheme={saveTheme}
	onSaveContrast={saveContrast}
/>

<Reminders
	{reminders}
	{emailNotificationsEnabled}
	hasAnyReminderEnabled={hasAnyReminderEnabled()}
	{savingReminders}
	{noticeReminders}
	onToggle={(v: boolean) => {
		emailNotificationsEnabled = v;
	}}
	onChange={(v: WeeklyReminderConfig) => {
		reminders = v;
	}}
	onSave={saveReminders}
/>
