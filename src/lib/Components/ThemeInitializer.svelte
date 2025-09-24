<script lang="ts">
  import { onMount } from 'svelte';
	import { applyTheme, applyThemeEditor, type EditorThemeName, type ThemeName } from '$lib/Themes';
	import { userPreferences } from '$lib/stores/theme';

  const mapUserThemesToEditorThemes = (theme : ThemeName): EditorThemeName => {
    switch (theme) {
      case 'light': return 'vs'
      case 'dark': return 'vs-dark'
    }
  } 

  onMount(() => {
    const unsubscribe = userPreferences.subscribe((prefs) => {
      applyTheme(prefs.theme as ThemeName);
      applyThemeEditor(mapUserThemesToEditorThemes(prefs.theme))
    });
    return unsubscribe;
  });
</script>

