<script lang="ts">
	import Monaco from '../Monaco/monaco.svelte';

	let {
		editorContents = $bindable(),
		theme,
		fontSize
	}: { editorContents: string; theme: string; fontSize: number } = $props();
</script>

<main class="w-full h-full">
	<Monaco {editorContents} {theme} {fontSize} readOnly={false} />
</main>
