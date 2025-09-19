<script lang="ts">
	import type { CodeEditorArg } from '$lib/types/CodeEditorArg';
	import Monaco from './monaco.svelte';

	let { options }: { options: CodeEditorArg } = $props();
</script>

<main class="w-full h-full">
	<Monaco editorContents={options.editorContents} />
</main>
