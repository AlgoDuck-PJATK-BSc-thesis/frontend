<script lang="ts">
	import { onMount } from 'svelte';
	import { userThemePreference } from '$lib/stores/theme.svelte';
	import { applyTheme, type ThemeName } from '$lib/Themes';

	let current: ThemeName = 'dark';

	const lightIcon = '/icons/theme-light.png';
	const darkIcon = '/icons/theme-dark.png';

	onMount(() => {
		if (typeof window === 'undefined') return;

		const attr = document.documentElement.getAttribute('data-theme') as ThemeName | null;

		if (attr) {
			current = attr;
		} else {
			current = userThemePreference.theme ?? 'dark';
			document.documentElement.setAttribute('data-theme', current);
			applyTheme(current);
		}
	});

	function toggleTheme() {
		const next: ThemeName = current === 'light' ? 'dark' : 'light';
		current = next;

		if (typeof window !== 'undefined') {
			document.documentElement.setAttribute('data-theme', next);
		}

		userThemePreference.theme = next;
		applyTheme(next);
	}
</script>

<button
	type="button"
	onclick={toggleTheme}
	aria-label="Toggle color theme"
	aria-pressed={current === 'dark'}
	class="fixed right-10 bottom-24 z-[999] flex items-center justify-center rounded-full bg-[color:var(--color-primary)]/90 p-1 shadow-[0_16px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform hover:scale-105 active:scale-95"
>
	<div class="relative flex h-8 w-14 items-center rounded-full bg-[color:var(--color-bg)]/70">
		<div
			class={`absolute inset-y-1 flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-primary)] shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-transform duration-200 ${
				current === 'light' ? 'translate-x-6' : 'translate-x-0'
			}`}
		>
			<img
				src={current === 'light' ? lightIcon : darkIcon}
				alt=""
				aria-hidden="true"
				class="h-4 w-4"
			/>
		</div>
	</div>
</button>
