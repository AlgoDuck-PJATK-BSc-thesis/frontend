<script lang="ts">
	import type { svgArg } from '$lib/types/SvgIcon';
	import type { Component } from 'svelte';

	export type SuggestionCardArgs = {
		prompt: string;
		icon: Component<{ options: svgArg }>;
		onclick?: (prompt: string) => void;
	};

	let {
		options
	}: {
		options: SuggestionCardArgs
	} = $props();
	let Icon: Component<{ options: svgArg }> = $derived(options.icon);
</script>

<button onclick={() => {
    if (options.onclick){
        options.onclick(options.prompt);
    }
}} class="flex h-20 w-50 flex-row p-5 bg-ide-card rounded-xl items-center gap-3 hover:bg-ide-dcard duration-300 transition-colors ease-out">
	<Icon options={{ class: 'w-6 h-6 stroke-[2] stroke-ide-accent/50' }} />
	<span class="text-start text-sm text-ide-text-secondary">{options.prompt}</span>
</button>
