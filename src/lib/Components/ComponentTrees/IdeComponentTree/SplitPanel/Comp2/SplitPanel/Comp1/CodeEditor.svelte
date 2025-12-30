<script lang="ts">
	import { FetchFromApi } from '$lib/api/apiCall';
	import type { CodeEditorComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import Monaco from '$lib/Components/GenericComponents/monaco/monaco.svelte';

	let { options = $bindable() }: { options: CodeEditorComponentArgs } = $props();

	type SaveState = "saving" | "saved" | "unsaved";

	let savingState: SaveState = $state("saved");

	let lastTimeout: NodeJS.Timeout | undefined;
	const autoSaveStallTimeMillis: number = 5000;


	// TODO: make this more selective to not spam server
	$effect(() => {
		if (!options.userCode || options.templateContents === options.userCode) return
		const currentCodeState: string = options.userCode;
		options.userCode = currentCodeState;
		if (!options || !options?.problemId || !options?.userCode) return;
		else console.log('saving');
		const templateContents: string = options.userCode;
		savingState = "unsaved";
		if (lastTimeout){
			clearTimeout(lastTimeout);
		}
		lastTimeout = setTimeout(async () => {
			console.log("posting");
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
	});
</script>

<main class="w-full h-full relative border border-ide-accent/10">
	<Monaco bind:editorContents={options.userCode} />
	<span class="absolute z-50 bottom-[1%] left-[1%] text-ide-text-secondary backdrop-blur-xs">{savingState}</span>
</main>
