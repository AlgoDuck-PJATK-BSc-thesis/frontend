<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import { FetchFromApi } from '$lib/api/apiCall';
	import type { CodeEditorComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import Monaco from '$lib/Components/GenericComponents/monaco/monaco.svelte';
	import { onDestroy } from 'svelte';

	let { options = $bindable() }: { options: CodeEditorComponentArgs } = $props();

	type SaveState = 'saving' | 'saved' | 'unsaved';

	let savingState: SaveState = $state('saved');
	let showRestoreModal: boolean = $state(false);

	let lastTimeout: number | undefined;
	const autoSaveStallTimeMillis: number = 5000;

	$effect(() => {
		if (
			!options.userCode ||
			options.templateContents === options.userCode ||
			options.isDetachedHeadMode
		) {
			return;
		}
		const currentCodeState: string = options.userCode;
		options.userCode = currentCodeState;
		if (!options || !options?.problemId || !options?.userCode) return;
		const templateContents: string = options.userCode;
		savingState = 'unsaved';

		if (lastTimeout) {
			clearTimeout(lastTimeout);
		}

		lastTimeout = setTimeout(async () => {
			savingState = 'saving';
			const res = await FetchFromApi('AutoSave', {
				method: 'POST',
				body: JSON.stringify({
					problemId: options.problemId,
					userCodeB64: btoa(templateContents)
				})
			});
			if (res.status === 'Success') {
				savingState = 'saved';
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
	};

	let monacoRef: Monaco | undefined = $state();
</script>

<main class="relative h-full w-full border border-ide-accent/10">
	{#if options.userCode !== undefined && options.userCode !== null}
		<Monaco bind:this={monacoRef} bind:editorContents={options.userCode} />
		<div
			class="absolute bottom-2 left-2 z-50 flex flex-col gap-0.5 rounded bg-ide-bg/25 px-2 py-1 font-mono text-xs text-[11px] backdrop-blur-sm"
		>
			{#if options.isDetachedHeadMode}
				<span class="text-ide-text-secondary/70"
					>Auto-save: <span class="text-amber-400">off</span> - detached head</span
				>
			{:else}
				<span class="text-ide-text-secondary/70"
					>Auto-save: <span class="text-green-400">on</span></span
				>
			{/if}
			<span class="text-[10px] text-ide-text-secondary">
				{#if savingState === 'saving'}
					<span class="text-blue-400">Saving...</span>
				{:else if savingState === 'saved'}
					<span class="text-ide-text-secondary/60">Saved</span>
				{:else}
					<span class="text-amber-400">Unsaved</span>
				{/if}
			</span>
		</div>
		<button
			class="absolute top-1 right-3 rounded px-5 py-2 text-ide-text-secondary/70 backdrop-blur-md transition-colors hover:bg-ide-text-primary/5"
			onclick={() => (showRestoreModal = true)}
		>
			Restore
		</button>
	{/if}

	{#if showRestoreModal}
		<div class="absolute inset-0 z-[100] flex items-center justify-center bg-black/50">
			<div
				class="max-w-sm rounded-lg border border-ide-accent/20 bg-ide-card p-5 shadow-xl"
				use:clickOutside={() => (showRestoreModal = false)}
			>
				<h3 class="mb-2 font-medium text-ide-text-primary">Restore Template?</h3>
				<p class="mb-4 text-sm text-ide-text-secondary/70">
					This will overwrite your current code with the original template. This action cannot be
					undone.
				</p>
				<div class="flex justify-end gap-2">
					<button
						class="rounded px-3 py-1.5 text-sm text-ide-text-secondary/70 transition-colors hover:bg-ide-dcard"
						onclick={() => (showRestoreModal = false)}
					>
						Cancel
					</button>
					<button
						class="rounded bg-red-800/80 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-800"
						onclick={handleRestore}
					>
						Restore
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>
