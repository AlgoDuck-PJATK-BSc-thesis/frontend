import { FetchFromApi, FetchJsonFromApi } from '$lib/api/apiCall';

export type UserConfigDto = {
	isDarkMode: boolean;
	isHighContrast: boolean;
	language: string;
	s3AvatarUrl: string;
	emailNotificationsEnabled: boolean;
	pushNotificationsEnabled: boolean;
};

export type UpdatePreferencesDto = {
	isDarkMode: boolean;
	isHighContrast: boolean;
	language: string;
	emailNotificationsEnabled: boolean;
	pushNotificationsEnabled: boolean;
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
	}
};
