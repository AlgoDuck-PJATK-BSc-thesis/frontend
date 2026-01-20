<script lang="ts">
	let { name, size = 18 } = $props<{ name: string; size?: number }>();
</script>

{#if name === 'play'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M8 5v14l11-7z" />
	</svg>
{:else if name === 'pause'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M6 5h4v14H6zM14 5h4v14h-4z" />
	</svg>
{:else if name === 'reset'}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<path d="M21 12a9 9 0 1 1-3-6.7" />
		<path d="M21 3v7h-7" />
	</svg>
{:else if name === 'search'}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<circle cx="11" cy="11" r="7" />
		<path d="M20 20l-3.5-3.5" />
	</svg>
{:else if name === 'plus'}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<path d="M12 5v14" />
		<path d="M5 12h14" />
	</svg>
{:else if name === 'minus'}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
	>
		<path d="M5 12h14" />
	</svg>
{:else}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
	</svg>
{/if}
