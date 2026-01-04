<script lang='ts'>
	import type { ItemCreateResponseDto } from "./ItemCreationTypes";

    let { submitResult, resetForm } : { submitResult: ItemCreateResponseDto, resetForm: (() => void) } = $props();

</script>

<div class="bg-admin-bg-secondary border border-admin-border-primary rounded overflow-hidden">
    <div class="flex items-center gap-3 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary">
        <div class="w-6 h-6 rounded-full bg-admin-accent-primary/20 flex items-center justify-center">
            <svg class="w-4 h-4 text-[#89d185]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
        </div>
        <h3 class="text-sm font-semibold text-[#89d185]">Item Created Successfully</h3>
    </div>
    <div class="p-4 flex flex-col gap-3">
        <div class="flex items-center gap-2 text-sm">
            <span class="text-admin-text-muted">Item ID:</span>
            <code class="px-2 py-0.5 bg-admin-bg-primary rounded text-admin-danger-text text-xs">{submitResult.createdItemGuid}</code>
        </div>
        
        {#if submitResult.files.length > 0}
            <div class="flex flex-col gap-2">
                <span class="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">File Upload Results</span>
                <div class="bg-admin-bg-primary border border-admin-border-primary rounded divide-y divide-admin-border-primary">
                    {#each submitResult.files as fileResult}
                        <div class="flex items-center justify-between px-3 py-2">
                            <span class="text-sm text-admin-text-secondary">{fileResult.fileName}</span>
                            {#if fileResult.result === "Success"}
                                <span class="flex items-center gap-1.5 text-xs text-[#89d185]">
                                    <span class="w-2 h-2 rounded-full bg-[#89d185]"></span>
                                    Success
                                </span>
                            {:else}
                                <span class="flex items-center gap-1.5 text-xs text-admin-danger-text" title={fileResult.reason}>
                                    <span class="w-2 h-2 rounded-full bg-admin-danger-text"></span>
                                    Failed
                                </span>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <div class="flex items-center gap-3 mt-2">
            <a href={`/items/item-details?itemId=${submitResult.createdItemGuid}`} class="px-4 py-2 text-sm bg-admin-accent-primary text-white rounded hover:bg-admin-accent-primary-hover transition-colors">
                View Item
            </a>
            <button onclick={resetForm} class="px-4 py-2 text-sm text-admin-text-secondary border border-admin-border-primary rounded hover:bg-admin-border-primary transition-colors">
                Create Another
            </button>
        </div>
    </div>
</div>