export type DisplayLanguage = 'en' | 'pl';

export type SettingsState = {
	profile: { username: string; email: string };
	security: { twoFactor: boolean };
	notifications: { email: boolean; push: boolean };
	preferences: { displayLanguage: DisplayLanguage };
};

export const defaultSettings: SettingsState = {
	profile: { username: '', email: '' },
	security: { twoFactor: false },
	notifications: { email: true, push: false },
	preferences: { displayLanguage: 'en' }
};

export const getSettings = async (): Promise<SettingsState> => {
	const res = await fetch('/api/settings', { method: 'GET' });
	if (!res.ok) throw new Error('Failed to load settings');
	return (await res.json()) as SettingsState;
};

export const patchSettings = async (patch: Partial<SettingsState>): Promise<SettingsState> => {
	const res = await fetch('/api/settings', {
		method: 'PATCH',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(patch)
	});
	if (!res.ok) throw new Error('Failed to save settings');
	return (await res.json()) as SettingsState;
};

export const applyPreferenceEffects = (settings: SettingsState) => {
	document.documentElement.lang = settings.preferences.displayLanguage;
};
