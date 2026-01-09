<script lang='ts' generics="T extends Record<string, any>">
    import type { Component } from "svelte";
    import type { PopOverColumnArgs } from "./columnPreviewArgs";
    import { fly } from "svelte/transition";

    let { options }: { options: PopOverColumnArgs<T> } = $props();

    let isPreviewVisible = $state(false);
    let previewData = $state<T | null>(null);
    let isLoading = $state(false);
    let error = $state<string | null>(null);

    let hoverTimeout: ReturnType<typeof setTimeout> | undefined;
    let hideTimeout: ReturnType<typeof setTimeout> | undefined;

    let triggerEl = $state<HTMLButtonElement | null>(null);
    let popoverEl = $state<HTMLDivElement | null>(null);

    const HOVER_DELAY = 300;
    const HIDE_DELAY = 150; 

    const showPreview = async () => {
        clearTimeout(hideTimeout);
        
        if (isPreviewVisible) return;
        
        isPreviewVisible = true;

        if (!previewData && !isLoading) {
            isLoading = true;
            error = null;
            try {
                previewData = await options.getPreviewData();
            } catch (e) {
                error = e instanceof Error ? e.message : 'Failed to load preview';
            } finally {
                isLoading = false;
            }
        }
    };

    const hidePreview = () => {
        clearTimeout(hoverTimeout);
        hideTimeout = setTimeout(() => {
            isPreviewVisible = false;
        }, HIDE_DELAY);
    };

    const cancelHide = () => {
        clearTimeout(hideTimeout);
    };

    const handleTriggerEnter = () => {
        hoverTimeout = setTimeout(showPreview, HOVER_DELAY);
    };

    const handleTriggerLeave = () => {
        clearTimeout(hoverTimeout);
        hidePreview();
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isPreviewVisible) {
            isPreviewVisible = false;
            triggerEl?.focus();
        }
    };

    let Comp: Component<{ options: T }> = $derived(options.displayComponent);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="w-full flex justify-center relative">
    <button
        bind:this={triggerEl}
        onmouseenter={handleTriggerEnter}
        onmouseleave={handleTriggerLeave}
        onfocus={showPreview}
        onblur={hidePreview}
        aria-describedby={isPreviewVisible ? 'popover-content' : undefined}
        class="w-full flex justify-center text-xs hover:text-admin-text-primary transition-colors"
    >
        {options.label}
    </button>

    {#if isPreviewVisible}
        <div
            bind:this={popoverEl}
            id="popover-content"
            role="tooltip"
            transition:fly={{ y: 8, duration: 150 }}
            onmouseenter={cancelHide}
            onmouseleave={hidePreview}
            class="
                absolute top-full mt-2 z-50
                bg-admin-bg-tertiary border border-admin-border-primary 
                rounded shadow-lg shadow-black/20
                min-w-48 max-w-80
            "
        >
            <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 
                        w-3 h-3 rotate-45 
                        bg-admin-bg-tertiary border-l border-t border-admin-border-primary">
            </div>

            <div class="relative p-3">
                {#if isLoading}
                    <div class="flex items-center gap-2 text-admin-text-muted text-sm">
                        <div class="w-4 h-4 rounded-full border-2 border-admin-border-primary border-t-admin-text-secondary animate-spin"></div>
                        <span>Loading...</span>
                    </div>
                {:else if error}
                    <div class="text-sm text-admin-danger-text">
                        {error}
                    </div>
                {:else if previewData}
                    <Comp options={previewData} />
                {/if}
            </div>
        </div>
    {/if}
</div>
