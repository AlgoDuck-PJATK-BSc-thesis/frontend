<script lang="ts">
    import type { InfoPanelComponentArgs } from '../../component-args';
    let { options = $bindable() }: { options: InfoPanelComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col border border-ide-accent/10 bg-ide-card overflow-y-auto overflow-x-hidden min-w-xl rounded-xl">
    <div class="px-8 pt-8 pb-6 border-b border-ide-accent/20">
        <h2 class="text-3xl font-bold text-ide-text-primary mb-4">
            {options.title}
        </h2>
        
        <div class="flex flex-wrap gap-2">
            {@render TagPill(options.title, true)}
            {#each options.tags as tag}
                {@render TagPill(tag.name, false)}
            {/each}
        </div>
    </div>
    
    <div class="px-8 py-6 flex-1 editor-wrapper text-ide-text-secondary">
        {#if options.description}
            {@html options.description}
			<!-- <MarkdownRenderer options={{markdown: options.description}}/> -->
        {/if}
    </div>
</main>

{#snippet TagPill(tagContents: string, isPrimary: boolean)}
    <div
        class="px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200
            {isPrimary 
                ? 'bg-ide-accent/20 text-ide-accent border border-ide-accent/40' 
                : 'bg-ide-accent/5 text-ide-text-secondary/80 border border-ide-accent/20 hover:border-ide-accent/40 hover:bg-ide-accent/10'}">
        {tagContents}
    </div>
{/snippet}

<style>
    .editor-wrapper :global(html) {
		background: #3c3c3c;
		color: #d4d0d0;
		border-radius: 8px;
		border: 1px solid rgb(116, 114, 114);
		height: 100%;
		padding: 0.75em 1.5em 0.75em 0.75em;
		font-size: medium;
		min-height: 150px;
		max-height: 250px;
		overflow-x: hidden;
		overflow-y: auto;
		outline: none;
	}

	.editor-wrapper :global(:focus) {
		border-color: #6b9ed8;
	}

	.editor-wrapper :global( p.is-editor-empty:first-child::before) {
		color: var(--color-ide-text-secondary);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
		opacity: 0.5;
	}

	.editor-wrapper :global( strong) {
		font-weight: 700;
	}

	.editor-wrapper :global( em) {
		font-style: italic;
	}

	.editor-wrapper :global( u) {
		text-decoration: underline;
	}

	.editor-wrapper :global( ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	.editor-wrapper :global( ol) {
		list-style-type: decimal;
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	.editor-wrapper :global( li) {
		margin: 0.25rem 0;
	}

	.editor-wrapper :global( li p) {
		margin: 0;
	}

	.editor-wrapper :global( ul ul) {
		list-style-type: circle;
	}

	.editor-wrapper :global( ul ul ul) {
		list-style-type: square;
	}

	.editor-wrapper :global( ol ol) {
		list-style-type: lower-alpha;
	}

	.editor-wrapper :global( ol ol ol) {
		list-style-type: lower-roman;
	}

	.editor-wrapper :global( h1) {
		font-weight: 700;
		font-size: 2rem;
		line-height: 1.2;
		margin: 1rem 0 0.5rem 0;
	}

	.editor-wrapper :global( h2) {
		font-weight: 600;
		font-size: 1.5rem;
		line-height: 1.25;
		margin: 0.875rem 0 0.5rem 0;
	}

	.editor-wrapper :global( h3) {
		font-weight: 600;
		font-size: 1.25rem;
		line-height: 1.3;
		margin: 0.75rem 0 0.5rem 0;
	}

	.editor-wrapper :global( h4) {
		font-weight: 600;
		font-size: 1.125rem;
		line-height: 1.35;
		margin: 0.625rem 0 0.375rem 0;
	}

	.editor-wrapper :global( h5) {
		font-weight: 600;
		font-size: 1rem;
		line-height: 1.4;
		margin: 0.5rem 0 0.375rem 0;
	}

	.editor-wrapper :global( h6) {
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1.4;
		margin: 0.5rem 0 0.375rem 0;
		color: #a0a0a0;
	}

	.editor-wrapper :global( pre) {
		background: #1e1e1e;
		border-radius: 6px;
		padding: 0.75rem 1rem;
		margin: 0.5rem 0;
		overflow-x: auto;
	}

	.editor-wrapper :global( pre code) {
		background: none;
		padding: 0;
		font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
		font-size: 0.875rem;
		color: #e0e0e0;
	}

	.editor-wrapper :global( code) {
		background: #2a2a2a;
		border-radius: 4px;
		padding: 0.125rem 0.375rem;
		font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
		font-size: 0.875em;
		color: #e06c75;
	}

	.editor-wrapper :global( blockquote) {
		border-left: 3px solid #6b9ed8;
		padding-left: 1rem;
		margin: 0.5rem 0;
		color: #a0a0a0;
		font-style: italic;
	}

	.editor-wrapper :global( hr) {
		border: none;
		border-top: 1px solid #555;
		margin: 1rem 0;
	}

	.editor-wrapper :global(p) {
		margin: 0.25rem 0;
	}
</style>