import type { WeeklyReminderConfig } from '$lib/types/StudyTimerTypes';
import { settingsApi, type Reminder, type UpdatePreferencesDto } from '$lib/api/settings';
import type { ThemeName } from '$lib/Themes';

const buildRemindersPayload = (
	emailNotificationsEnabled: boolean,
	reminders: WeeklyReminderConfig
): Reminder[] | null => {
	if (!emailNotificationsEnabled) return null;

	const list = Array.isArray(reminders) ? reminders : [];

	const mapped = list
		.map((r: any) => ({
			day: String(r?.day ?? '').trim(),
			enabled: !!r?.enabled,
			hour: Number(r?.hour ?? 0),
			minute: Number(r?.minute ?? 0)
		}))
		.filter((r: Reminder) => !!r.day);

	const anyEnabled = mapped.some((r) => r.enabled);

	if (!anyEnabled) return [];

	return mapped;
};

const buildPreferencesDto = (
	theme: ThemeName,
	highContrast: boolean,
	emailNotificationsEnabled: boolean,
	reminders: WeeklyReminderConfig
): UpdatePreferencesDto => {
	return {
		isDarkMode: theme === 'dark',
		isHighContrast: highContrast,
		emailNotificationsEnabled: !!emailNotificationsEnabled,
		weeklyReminders: buildRemindersPayload(emailNotificationsEnabled, reminders)
	};
};

export const persistPreferences = async (
	fetchFn: typeof fetch,
	theme: ThemeName,
	highContrast: boolean,
	emailNotificationsEnabled: boolean,
	reminders: WeeklyReminderConfig
) => {
	const dto = buildPreferencesDto(theme, highContrast, emailNotificationsEnabled, reminders);
	await settingsApi.updatePreferences(dto, fetchFn);
};
