<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import { FetchFromApi } from '$lib/api/apiCall';
	import type { CodeEditorComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import Monaco from '$lib/Components/GenericComponents/monaco/monaco.svelte';
	import { onDestroy } from 'svelte';

	let { options = $bindable() }: { options: CodeEditorComponentArgs } = $props();

	type SaveState = "saving" | "saved" | "unsaved";

	let savingState: SaveState = $state("saved");
	let showRestoreModal: boolean = $state(false);

	let lastTimeout: NodeJS.Timeout | undefined;
	const autoSaveStallTimeMillis: number = 5000;

	$effect(() => {
		if (!options.userCode || options.templateContents === options.userCode || options.isDetachedHeadMode) {
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
		monacoRef.updateEditorExternal(options.userCode);
		options.upstreamChanged = false;
	});

	onDestroy(() => clearTimeout(lastTimeout));

	const handleRestore = () => {
		options.restoreTemplate();
		showRestoreModal = false;
	}

	let monacoRef: Monaco | undefined = $state()
</script>

<main class="w-full h-full relative border border-ide-accent/10">
	{#if options.userCode !== undefined && options.userCode !== null}
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
		<button class="absolute top-1 right-3 px-5 py-2 backdrop-blur-md text-ide-text-secondary/70 hover:bg-ide-text-primary/5 rounded transition-colors"
			onclick={() => showRestoreModal = true}>
			Restore
		</button>
	{/if}
	
	{#if showRestoreModal}
		<div class="absolute inset-0 z-[100] flex items-center justify-center bg-black/50">
			<div class="bg-ide-card border border-ide-accent/20 rounded-lg p-5 max-w-sm shadow-xl"
				use:clickOutside={() => showRestoreModal = false}>
				<h3 class="text-ide-text-primary font-medium mb-2">Restore Template?</h3>
				<p class="text-ide-text-secondary/70 text-sm mb-4">
					This will overwrite your current code with the original template. This action cannot be undone.
				</p>
				<div class="flex justify-end gap-2">
					<button class="px-3 py-1.5 text-sm text-ide-text-secondary/70 hover:bg-ide-dcard rounded transition-colors"
						onclick={() => showRestoreModal = false}>
						Cancel
					</button>
					<button class="px-3 py-1.5 text-sm bg-red-800/80 hover:bg-red-800 text-white rounded transition-colors"
						onclick={handleRestore}>
						Restore
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>