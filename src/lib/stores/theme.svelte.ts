import { type EditorThemeName, type ThemeName } from '$lib/Themes';
import type { LayoutDto } from '../../routes/(authenticated)/(user)/categories/problems/solve/types';
import DefaultLayout from '$lib/Components/ComponentTrees/IdeComponentTree/default-layout.json'

export const SupportedLangs = ['pl', 'en'] as const;
export type Lang = (typeof SupportedLangs)[number];

export const userThemePreference: { theme: ThemeName; lang: Lang } = $state({
	theme: 'dark',
	lang: 'en'
});

export const userEditorPreferences: { theme: EditorThemeName; fontSize: number, layout: LayoutDto } = $state({
	theme: 'vs-dark',
	fontSize: 16,
	layout: {
		layoutName: 'default',
		layoutId: '',
		layoutContent: DefaultLayout
	}
});
