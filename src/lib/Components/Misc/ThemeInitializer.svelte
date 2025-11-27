<script lang="ts">
  import { onMount } from 'svelte';
	import { applyTheme, applyThemeEditor, type EditorThemeName, type ThemeName } from '$lib/Themes';
	import { userThemePreference } from '$lib/stores/theme.svelte';

  const mapUserThemesToEditorThemes = (theme : ThemeName): EditorThemeName => {
    switch (theme) {
      case 'light': return 'vs'
      case 'dark': return 'vs-dark'
    }
  } 

  onMount(() => {
    applyTheme(userThemePreference.theme as ThemeName);
    applyThemeEditor(mapUserThemesToEditorThemes(userThemePreference.theme))
  });
</script>

