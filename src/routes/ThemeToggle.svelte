<script lang="ts">
	import { userPreferences } from "../Stores/theme";

	let current = 'light';

	if (typeof window !== 'undefined') {
		current = document.documentElement.getAttribute('data-theme') || 'light';
	}

	function toggleTheme() {
		current = current === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', current);
		userPreferences.set({theme: `${current}`});
	}
</script>

<button
	onclick={toggleTheme}
	class="text-xl text-[color:var(--color-text)] bg-transparent border-none cursor-pointer px-1 py-0.5 leading-none hover:text-[color:var(--color-primary)] transition-colors duration-200"
>
	{#if current === 'light'}
		🌙
	{:else}
		🌞
	{/if}
</button>