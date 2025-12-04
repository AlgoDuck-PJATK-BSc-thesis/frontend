<script lang="ts">
	import '../app.css';
	import AccessibilitySquareButton from '$lib/Components/AccessibilityComponents/AccessibilitySquareButtonStatic.svelte';
	import AccessibilityPanel from '$lib/Components/AccessibilityComponents/AccessibilityPanel.svelte';
	import ThemeInitializer from '$lib/Components/Misc/ThemeInitializer.svelte';
	import RegistryInitializer from '$lib/Components/GenericComponents/layoutManager/RegistryInitializer.svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

	let togglePanelFn: () => void;

	function handleToggle() {
		togglePanelFn?.();
	}

	let { children } = $props();

	const queryClient: QueryClient = new QueryClient({
    	defaultOptions: {
    	  	queries: {
    	  	  	staleTime: 60 * 1000, 
    	  	},
    	},
  	});
</script>

<ThemeInitializer />
<RegistryInitializer />

<QueryClientProvider client={queryClient}>
	<div class="h-screen w-screen">
	<AccessibilitySquareButton ontoggle={handleToggle} />
	<AccessibilityPanel toggleRef={(fn) => (togglePanelFn = fn)} />
		
		<main class="h-full w-full">
			{@render children?.()}
		</main>
	</div>
</QueryClientProvider>
