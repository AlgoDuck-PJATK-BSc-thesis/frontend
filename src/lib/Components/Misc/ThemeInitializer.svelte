<script lang="ts">
	import { onMount } from 'svelte';
	import { applyTheme, applyThemeEditor, type EditorThemeName, type ThemeName } from '$lib/Themes';
	import { loadAndApplyUserConfig } from '$lib/api/userSettings';
	import { userThemePreference } from '$lib/stores/theme.svelte';

	const mapUserThemesToEditorThemes = (theme: ThemeName): EditorThemeName => {
		switch (theme) {
			case 'light':
				return 'vs';
			case 'dark':
				return 'vs-dark';
			default:
				return 'vs-dark';
		}
	};

	const applyFromStore = () => {
		applyTheme(userThemePreference.theme);
		applyThemeEditor(mapUserThemesToEditorThemes(userThemePreference.theme));
	};

	onMount(() => {
		applyFromStore();

		void loadAndApplyUserConfig()
			.then(() => {
				applyThemeEditor(mapUserThemesToEditorThemes(userThemePreference.theme));
			})
			.catch(() => {});
	});
</script>
