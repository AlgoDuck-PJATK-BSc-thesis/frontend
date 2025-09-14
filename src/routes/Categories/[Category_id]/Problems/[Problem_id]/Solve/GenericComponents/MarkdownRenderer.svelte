<script lang="ts">
	import { marked } from 'marked';
	let { markdown }: { markdown: string } = $props();
	let htmlContent = $derived(marked.parse(markdown));
</script>

<div class="prose prose-invert max-w-none">
	{@html htmlContent}
</div>
