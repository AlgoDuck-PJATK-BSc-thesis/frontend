import { FetchFromApi, FetchJsonFromApi } from '$lib/api/apiCall';

export type ReminderDto = {
	day: string;
	enabled: boolean;
	hour: number;
	minute: number;
};

export type Reminder = ReminderDto;

export type UserConfigDto = {
	isDarkMode: boolean;
	isHighContrast: boolean;
	language: string;
	emailNotificationsEnabled: boolean;
	username: string;
	email: string;
	weeklyReminders: ReminderDto[];
	s3AvatarUrl: string;
};

export type UpdatePreferencesDto = {
	isDarkMode: boolean;
	isHighContrast: boolean;
	emailNotificationsEnabled: boolean;
	weeklyReminders?: ReminderDto[] | null;
};

export type UpdateUsernameDto = {
	newUserName: string;
};

export type ChangePasswordDto = {
	currentPassword: string;
	newPassword: string;
};

export const settingsApi = {
	getUserConfig: async (fetcher?: typeof fetch): Promise<UserConfigDto> => {
		const res = await FetchFromApi<UserConfigDto>('user/config', { method: 'GET' }, fetcher);
		return res.body;
	},

	updatePreferences: async (dto: UpdatePreferencesDto, fetcher?: typeof fetch): Promise<void> => {
		await FetchJsonFromApi<unknown>(
			'user/preferences',
			{
				method: 'PUT',
				body: JSON.stringify(dto)
			},
			fetcher
		);
	},

	selectAvatar: async (itemId: string, fetcher?: typeof fetch): Promise<void> => {
		const clean = (itemId ?? '').trim();
		if (!clean) throw new Error('Invalid avatar itemId.');
		await FetchJsonFromApi<unknown>(
			'user/avatar',
			{
				method: 'PUT',
				body: JSON.stringify({ itemId: clean })
			},
			fetcher
		);
	},

	updateUsername: async (dto: UpdateUsernameDto, fetcher?: typeof fetch): Promise<void> => {
		await FetchJsonFromApi<unknown>(
			'user/username',
			{
				method: 'PUT',
				body: JSON.stringify(dto)
			},
			fetcher
		);
	},

	changePassword: async (dto: ChangePasswordDto, fetcher?: typeof fetch): Promise<void> => {
		await FetchJsonFromApi<unknown>(
			'user/password/change',
			{
				method: 'POST',
				body: JSON.stringify(dto)
			},
			fetcher
		);
	},

	deleteAccount: async (fetcher?: typeof fetch): Promise<void> => {
		await FetchJsonFromApi<unknown>('user/account', { method: 'DELETE' }, fetcher);
	}
};
