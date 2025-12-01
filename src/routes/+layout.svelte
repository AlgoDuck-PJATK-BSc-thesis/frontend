<script lang="ts">
	import '../app.css';
	import AccessibilitySquareButton from '$lib/Components/AccessibilityComponents/AccessibilitySquareButtonStatic.svelte';
	import AccessibilityPanel from '$lib/Components/AccessibilityComponents/AccessibilityPanel.svelte';
	import ThemeInitializer from '$lib/Components/Misc/ThemeInitializer.svelte';
	import RegistryInitializer from '$lib/Components/GenericComponents/layoutManager/RegistryInitializer.svelte';

	let togglePanelFn: () => void;

	function handleToggle() {
		togglePanelFn?.();
	}

	let { children } = $props();
</script>

<ThemeInitializer />
<RegistryInitializer />

<div class="h-screen w-screen">
	<AccessibilitySquareButton ontoggle={handleToggle} />
	<AccessibilityPanel toggleRef={(fn) => (togglePanelFn = fn)} />

	<main class="h-full w-full">
		{@render children?.()}
	</main>
</div>
