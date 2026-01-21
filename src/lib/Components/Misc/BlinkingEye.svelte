<script lang="ts">
	type SvgOptions = {
		class?: string;
	};

	export let open: boolean = false;
	export let options: SvgOptions = {};
	export let title: string = '';
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={options.class ?? ''}
	aria-hidden={title ? undefined : 'true'}
	role={title ? 'img' : 'presentation'}
>
	{#if title}
		<title>{title}</title>
	{/if}

	{#if open}
		<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
		<circle cx="12" cy="12" r="3" />
	{:else}
		<path d="M10.6 10.6A2 2 0 0 0 12 15a2 2 0 0 0 1.4-.6" />
		<path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-3.2 4.5" />
		<path d="M6.6 6.6A18.4 18.4 0 0 0 2 12s3.5 8 10 8c1 0 2-.2 3-.6" />
		<path d="M2 2l20 20" />
	{/if}
</svg>
