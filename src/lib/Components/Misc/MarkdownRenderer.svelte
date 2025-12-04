<script lang="ts">
	import { marked } from 'marked';
	let { options }: { options: { markdown: string, class?: string }} = $props();
	let htmlContent = $derived(marked.parse(options.markdown));
</script>

<div class="{options.class}">
	{@html htmlContent}
</div>
