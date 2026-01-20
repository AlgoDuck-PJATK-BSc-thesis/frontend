<script lang="ts">
    import { marked } from 'marked';
    let { options }: { options: { markdown: string, class?: string }} = $props();
    let htmlContent = $derived(marked.parse(options.markdown));
</script>

<div class="{options.class} markdown-content">
    {@html htmlContent}
</div>

<style>
    .markdown-content :global(*) {
        color: inherit !important;
    }
</style>