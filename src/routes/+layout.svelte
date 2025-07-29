<script lang="ts">
	import { page } from '$app/stores';
	import HeaderGuest from './headers/HeaderGuest.svelte';
	import HeaderUser from './headers/HeaderUser.svelte';
	import '../app.css';

	import AccessibilityButton from '../Components/AccessibilityComponents/AccessibilityButton.svelte';
	import AccessibilityPanel from '../Components/AccessibilityComponents/AccessibilityPanel.svelte';

	let togglePanelFn: () => void;

	function handleToggle() {
		togglePanelFn?.();
	}

	let { children } = $props();

	let path = $page.url.pathname;
	
	let isLoggedIn =
		path.startsWith('/home') ||
		path.startsWith('/problems') ||
		path.startsWith('/cohorts') ||
		path.startsWith('/contest') ||
		path.startsWith('/store') ||
		path.startsWith('/leaderboard') ||
		path.startsWith('/settings');
		
</script>

<div class="min-h-screen flex flex-col bg-[color:var(--color-bg)] text-[color:var(--color-text)] font-body transition-colors duration-300">
	<!-- {#if /* isLoggedIn */ true} -->
	{#if isLoggedIn}
		<HeaderUser />
	{:else}
		<HeaderGuest />
	{/if}

	<AccessibilityButton ontoggle={handleToggle} />
	<AccessibilityPanel toggleRef={(fn) => (togglePanelFn = fn)} />

	<main class="flex-1 w-full max-w-full mx-auto px-4 py-8 box-border">
		{@render children?.()}
	</main>

	<footer class="fixed bottom-0 left-0 w-full bg-[color:var(--color-bg)] text-center p-2 text-xs text-[color:var(--color-accent-2)] z-[100]">
		<p>© {new Date().getFullYear()} Beetcode</p>
	</footer>
</div>