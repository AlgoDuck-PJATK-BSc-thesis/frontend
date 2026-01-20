import { applyContrast, applyTheme, type ThemeName } from '$lib/Themes';
import { accessibility } from '$lib/stores/accessibility.svelte';
import { userThemePreference } from '$lib/stores/theme.svelte';

export type PreferenceEffectsInput = {
	theme?: ThemeName;
	isHighContrast?: boolean;
};

export const applyPreferenceEffects = (prefs: PreferenceEffectsInput) => {
	if (prefs.theme === 'dark' || prefs.theme === 'light') {
		userThemePreference.theme = prefs.theme;
		applyTheme(prefs.theme);
	}

	if (typeof prefs.isHighContrast === 'boolean') {
		accessibility.contrast = prefs.isHighContrast ? 1 : 0;
		applyContrast(prefs.isHighContrast ? '1' : '0');
	}
};
