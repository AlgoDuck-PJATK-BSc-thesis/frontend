import { userThemePreference, type Lang } from '$lib/stores/theme.svelte';
import { applyTheme, type ThemeName } from '$lib/Themes';

export type PreferenceEffectsInput = {
	isDarkMode?: boolean;
	language?: string;
};

const normalizeLang = (v: string | undefined): Lang | null => {
	const s = (v ?? '').trim().toLowerCase();
	if (s === 'pl') return 'pl';
	if (s === 'en') return 'en';
	return null;
};

export const applyPreferenceEffects = (prefs: PreferenceEffectsInput) => {
	if (typeof prefs.isDarkMode === 'boolean') {
		const nextTheme: ThemeName = prefs.isDarkMode ? 'dark' : 'light';
		userThemePreference.theme = nextTheme;
		applyTheme(nextTheme);
	}

	const nextLang = normalizeLang(prefs.language);
	if (nextLang) userThemePreference.lang = nextLang;
};
