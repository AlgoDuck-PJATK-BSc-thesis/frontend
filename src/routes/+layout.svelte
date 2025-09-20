<script lang="ts">
	import { page } from '$app/state';
	import '../app.css';
	import HeaderGuest from './headers/HeaderGuest.svelte';
	import HeaderUser from './headers/HeaderUser.svelte';
	import AccessibilitySquareButton from '$lib/Components/AccessibilityComponents/AccessibilitySquareButtonStatic.svelte';
	import AccessibilityPanel from '$lib/Components/AccessibilityComponents/AccessibilityPanel.svelte';
	import ThemeInitializer from '$lib/Components/ThemeInitializer.svelte';
	import RegistryInitializer from '$lib/Components/RegistryInitializer.svelte';

	let togglePanelFn: () => void;

	function handleToggle() {
		togglePanelFn?.();
	}

	let { children } = $props();
	let path = page.url.pathname;
	let isLoggedIn =
		path.startsWith('/home') ||
		path.startsWith('/problems') ||
		path.startsWith('/cohort') ||
		path.startsWith('/contest') ||
		path.startsWith('/store') ||
		path.startsWith('/leaderboard') ||
		path.startsWith('/settings');
	let hideHeader = $derived(page.data.hideHeader);
</script>

<ThemeInitializer />
<RegistryInitializer />
<div
	class="font-body flex min-h-screen flex-col bg-[color:var(--color-bg)] text-[color:var(--color-text)] transition-colors duration-300"
>
	{#if !hideHeader}
		{#if isLoggedIn}
			<HeaderUser />
		{:else}
			<HeaderGuest />
		{/if}
	{/if}

	<AccessibilitySquareButton ontoggle={handleToggle} />
	<AccessibilityPanel toggleRef={(fn) => (togglePanelFn = fn)} />

	<main class="mx-auto box-border w-full max-w-full flex-1">
		{@render children?.()}
	</main>

	<!-- <footer class="fixed bottom-0 left-0 w-full bg-[color:var(--color-bg)] text-center p-3 text-xs text-[color:var(--color-accent-2)] z-[100]">
		<p>© {new Date().getFullYear()} Beetcode</p>
	</footer> -->
</div>
