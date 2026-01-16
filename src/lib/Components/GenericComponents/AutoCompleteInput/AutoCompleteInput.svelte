<script lang="ts" generics="TCompletion extends Record<string, any>">
	import type { Component } from 'svelte';
	import type { ComponentConfigStatic } from './ComponentConfigStatic';

	interface Props {
		label: string;
		placeholder?: string;
		getRecommendations: (query: string) => TCompletion[];
		onSelect: (item: TCompletion) => void;
		suggestionCard: ComponentConfigStatic<TCompletion>;
		makeSelectedLabel?: (item: TCompletion) => string;
	}

	let {
		options
	}: {
		options: Props;
	} = $props();

	let value: string = $state('');
	let currTimeout: number | undefined;
	let querySnapshot: string = '';
	let recommendations: TCompletion[] = $state([]);
	let isFocused: boolean = $state(false);
	let inputElement: HTMLInputElement | undefined = $state();

	let SuggestionCard: Component<{ options: TCompletion; rootElement?: HTMLElement }> = $derived(
		options.suggestionCard.component
	);

	$effect(() => {
		if (currTimeout) clearTimeout(currTimeout);

		querySnapshot = !value || value.length === 0 ? '*' : value;

		currTimeout = setTimeout(async () => {
			recommendations = await options.getRecommendations(querySnapshot);
		}, 100);
	});

	const handleSelect = (item: TCompletion) => {
		options.onSelect(item);
		inputElement?.blur();
	};
</script>

<div>
	<span class="text-text mb-2 block text-sm font-semibold">{options.label}</span>
	<div class="relative">
		<input
			bind:this={inputElement}
			bind:value
			type="text"
			onfocus={() => {
				isFocused = true;
			}}
			onblur={() =>
				setTimeout(() => {
					isFocused = false;
				}, 100)}
			class="bg-bg text-text border-card w-full rounded-lg border-2 px-4 py-2.5 transition-all outline-none"
			placeholder={options.placeholder}
		/>

		{#if isFocused}
			<div
				class="bg-bg-alt border-card absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-hidden overflow-y-auto rounded-lg border-2 shadow-lg"
			>
				{#each recommendations as recommendation}
					<button
						type="button"
						onmousedown={() => {
							if (options.makeSelectedLabel) {
								value = options.makeSelectedLabel(recommendation);
							}
							handleSelect(recommendation);
						}}
						class="bg-bg-alt hover:bg-bg w-full border-b px-4 py-3 text-left transition-all last:border-b-0"
					>
						<SuggestionCard options={recommendation} />
					</button>
				{:else}
					<div class="w-full px-4 py-3 transition-all text-left border-b last:border-b-0 bg-bg-alt">
						<p class="font-medium text-text">No matches</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
