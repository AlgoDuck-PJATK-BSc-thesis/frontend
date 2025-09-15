<script lang="ts">
	import Monaco from '../Monaco/monaco.svelte';
	import type { CodeEditorArg } from './Types/CodeEditorArg';

	let { options }: { options: CodeEditorArg } = $props();
</script>

<main class="w-full h-full">
	<Monaco editorContents={options.editorContents} />
</main>
