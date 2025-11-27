<script lang="ts">
	import Monaco from '$lib/Components/GenericComponents/monaco/monaco.svelte';
	import type { CodeEditorArg } from '$lib/types/CodeEditorArg';

	let { options = $bindable() }: { options: CodeEditorArg } = $props();
</script>

<main class="w-full h-full">
	<Monaco bind:editorContents={options.editorContents} />
</main>
