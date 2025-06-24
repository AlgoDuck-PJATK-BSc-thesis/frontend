<script lang="ts">
	let current = 'light';

	if (typeof window !== 'undefined') {
		current = document.documentElement.getAttribute('data-theme') || 'light';
	}

	function toggleTheme() {
		current = current === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', current);
	}
</script>

<button on:click={toggleTheme} class="theme-toggle">
	{#if current === 'light'}
		🌙
	{:else}
		🌞
	{/if}
</button>

<style>
	.theme-toggle {
		font-size: 1.2rem;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text);
		padding: 0.5rem;
		transition: color 0.2s ease;
	}
	.theme-toggle:hover {
		color: var(--color-primary);
	}
</style>
