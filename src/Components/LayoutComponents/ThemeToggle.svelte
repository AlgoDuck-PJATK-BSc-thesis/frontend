<script lang="ts">
	import { userPreferences } from '../../Stores/theme';

	let current = 'light';

	if (typeof window !== 'undefined') {
		current = document.documentElement.getAttribute('data-theme') || 'light';
	}

	function toggleTheme() {
		current = current === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', current);
		userPreferences.set({ theme: `${current}` });
	}
</script>

<button
	onclick={toggleTheme}
	class="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-[color:var(--color-text)] transition-colors duration-200 hover:text-[color:var(--color-primary)]"
>
	{#if current === 'light'}
		🌞
	{:else}
		🌙
	{/if}
</button>
