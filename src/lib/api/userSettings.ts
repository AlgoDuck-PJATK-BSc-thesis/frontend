import { settingsApi, type UpdatePreferencesDto, type UserConfigDto } from '$lib/api/settings';
import { applyPreferenceEffects } from '$lib/stores/applyPreferenceEffects';

export const loadAndApplyUserConfig = async (fetcher?: typeof fetch): Promise<UserConfigDto> => {
	const config = await settingsApi.getUserConfig(fetcher);
	applyPreferenceEffects({
		theme: config.isDarkMode ? 'dark' : 'light',
		isHighContrast: config.isHighContrast
	});
	return config;
};

export const savePreferencesAndApply = async (
	dto: UpdatePreferencesDto,
	fetcher?: typeof fetch
): Promise<void> => {
	await settingsApi.updatePreferences(dto, fetcher);
	applyPreferenceEffects({
		theme: dto.isDarkMode ? 'dark' : 'light',
		isHighContrast: dto.isHighContrast
	});
};
