<script lang="ts">
	import Monaco from '../Monaco/monaco.svelte';

	let {
		editorContents = $bindable(),
		fontSize
	}: { editorContents: string; fontSize: number } = $props();
</script>

<main class="w-full h-full">
	<Monaco {editorContents} {fontSize} readOnly={false} />
</main>
