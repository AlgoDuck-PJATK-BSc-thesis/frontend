<script lang="ts">
	import { FetchFromApi } from '$lib/api/apiCall';
	import type { CodeEditorComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import Monaco from '$lib/Components/GenericComponents/monaco/monaco.svelte';
	import { onDestroy } from 'svelte';

	let { options = $bindable() }: { options: CodeEditorComponentArgs } = $props();

	type SaveState = "saving" | "saved" | "unsaved";

	let savingState: SaveState = $state("saved");

	let lastTimeout: NodeJS.Timeout | undefined;
	const autoSaveStallTimeMillis: number = 5000;


	$inspect(options);
	// TODO: make this more selective to not spam server
	$effect(() => {
		if (!options.userCode || options.templateContents === options.userCode || options.isDetachedHeadMode) {
			console.log('skipping auto save');
			return;
		}
		const currentCodeState: string = options.userCode;
		options.userCode = currentCodeState;
		if (!options || !options?.problemId || !options?.userCode) return;
		const templateContents: string = options.userCode;
		savingState = "unsaved";

		if (lastTimeout){
			clearTimeout(lastTimeout);
		}

		lastTimeout = setTimeout(async () => {
			savingState = "saving";
			const res = await FetchFromApi("AutoSave", {
				method: 'POST',
				body: JSON.stringify({
					problemId: options.problemId,
					userCodeB64: btoa(templateContents)
				})
			});
			if (res.status === "Success"){
				savingState = "saved";
			}
		}, autoSaveStallTimeMillis);

		return () => clearTimeout(lastTimeout);
	});

	$effect(() => {
		if (!options.upstreamChanged) return;
		if (!monacoRef || !options.userCode) return;
		console.log("effecting");
		monacoRef.updateEditorExternal(options.userCode);
		options.upstreamChanged = false;
	});

	onDestroy(() => clearTimeout(lastTimeout));

	let monacoRef: Monaco | undefined = $state()
</script>

<main class="w-full h-full relative border border-ide-accent/10">
	<Monaco bind:this={monacoRef} bind:editorContents={options.userCode} />
	<div class="absolute z-50 bottom-2 left-2 text-[11px] flex flex-col gap-0.5 text-xs font-mono backdrop-blur-sm bg-ide-bg/25 px-2 py-1 rounded">
		{#if options.isDetachedHeadMode}
			<span class="text-ide-text-secondary/70">Auto-save: <span class="text-amber-400">off</span> - detached head</span>
		{:else}
			<span class="text-ide-text-secondary/70">Auto-save: <span class="text-green-400">on</span></span>
		{/if}
		<span class="text-ide-text-secondary text-[10px]">
			{#if savingState === "saving"}
				<span class="text-blue-400">Saving...</span>
			{:else if savingState === "saved"}
				<span class="text-ide-text-secondary/60">Saved</span>
			{:else}
				<span class="text-amber-400">Unsaved</span>
			{/if}
		</span>
	</div>
</main>