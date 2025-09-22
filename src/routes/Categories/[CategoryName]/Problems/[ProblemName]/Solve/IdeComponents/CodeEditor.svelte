<script lang="ts">
	import type { CodeEditorArg } from '$lib/types/CodeEditorArg';
	import Monaco from './HelperComponents/monaco.svelte';

	let { options = $bindable() }: { options: CodeEditorArg } = $props();
</script>

<main class="w-full h-full">
	<Monaco bind:editorContents={options.editorContents} />
</main>
