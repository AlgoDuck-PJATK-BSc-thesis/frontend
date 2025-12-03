<script lang="ts">
	import type { CodeEditorComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import Monaco from '$lib/Components/GenericComponents/monaco/monaco.svelte';

	let { options = $bindable() }: { options: CodeEditorComponentArgs } = $props();

	$inspect(`from editro : ${options.templateContents}`);
</script>

<main class="w-full h-full">
	<Monaco bind:editorContents={options.templateContents} />
</main>
