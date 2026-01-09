<script lang="ts">
	import { userThemePreference } from '$lib/stores/theme.svelte';
	import { accessibility } from '$lib/stores/accessibility.svelte';
	import lightLandingGif from '$lib/images/LandingPage/lightLandingPage.gif';
	import darkLandingGif from '$lib/images/LandingPage/darkLandingPage.gif';
	import lightLandingPng from '$lib/images/LandingPage/lightLandingPageStatic.png';
	import darkLandingPng from '$lib/images/LandingPage/darkLandingPageStatic.png';

	const gifSrc = $derived(userThemePreference.theme === 'light' ? lightLandingGif : darkLandingGif);

	const pngSrc = $derived(userThemePreference.theme === 'light' ? lightLandingPng : darkLandingPng);

	const backgroundSrc = $derived(accessibility.reduceMotion ? pngSrc : gifSrc);
</script>

<img
	src={backgroundSrc}
	alt="landing page background"
	class="landing-bg pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
/>
