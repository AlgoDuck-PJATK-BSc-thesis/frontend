<script lang="ts">
  import { onMount } from 'svelte';
	import { userPreferences } from '../../Stores';
	import { applyTheme, applyThemeEditor, type EditorThemeName, type ThemeName } from '$lib/Themes';

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

