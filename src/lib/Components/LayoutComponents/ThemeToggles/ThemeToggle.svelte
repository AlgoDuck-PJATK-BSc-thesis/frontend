<script lang="ts">
	import { userThemePreference } from '$lib/stores/theme.svelte';
	import { applyTheme, type ThemeName } from '$lib/Themes';

	let interval: NodeJS.Timeout | null;
	const totalFrames: number = 11;

	let frame: number = $state(1);

	const toggleTheme = (): void => {
		if (interval) return;

		let toggleTo: ThemeName = userThemePreference.theme === 'light' ? 'dark' : 'light';
		interval = setInterval(() => {
			frame =
				userThemePreference.theme === 'light'
					? Math.max(1, frame - 1)
					: Math.min(frame + 1, totalFrames);
			if (frame == 1 || frame == totalFrames) {
				clearInterval(interval!);
				interval = null;
				userThemePreference.theme = toggleTo;
				applyTheme(userThemePreference.theme);
			}
		}, 30);
	};
</script>

<button onclick={toggleTheme} aria-label="Toggle theme" class="flex w-full items-center">
	<img
		src={`/ThemeSwitch2/Blue ver MERGED - ${frame}.png`}
		alt="{userThemePreference.theme} - theme toggle"
	/>
</button>
