<script lang='ts'>
	import { clickOutside } from "$lib/actions/clickOutside";
	import { FetchFromApi } from "$lib/api/apiCall";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";
	import WarningIconSvg from "$lib/svg/Toast/WarningIconSvg.svelte";
	import type { ItemDto } from "./types";

    let { isVisible = $bindable(), selectedItems }: { isVisible: boolean, selectedItems: ItemDto[] } = $props();

    let currentInput: string = $state("");
    let isDeleting: boolean = $state(false);

    const CONFIRMATION_TEXT = "permanently delete";
    const isConfirmed = $derived(currentInput.toLowerCase() === CONFIRMATION_TEXT);

    const closeModal = () => {
        if (!isDeleting) {
            isVisible = false;
            currentInput = "";
        }
    };

    const deleteSingleItem = async (itemId: string) => {
        return await FetchFromApi<{ itemId: string }>("DeleteItemById", {
            method: "DELETE"
        }, fetch, new URLSearchParams({ itemId: itemId }));
    };

    const bulkItemDelete = async () => {
        if (!isConfirmed || isDeleting) return;
        
        isDeleting = true;
        try {
            for (const item of selectedItems) {
                await deleteSingleItem(item.id);
            }
            closeModal();
        } finally {
            isDeleting = false;
        }
    };
</script>

{#if isVisible}
    <div role="dialog" class="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4">
        <div use:clickOutside={closeModal} 
            class="w-full max-w-lg bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-2xl overflow-hidden">
            <div class="flex items-center justify-between px-5 py-4 bg-[#2d2d2d] border-b border-[#3c3c3c]">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[#5a1d1d] flex items-center justify-center">
                        <BinIconSvg options={{ class: 'w-4 h-4 stroke-[2] stroke-[#f48771]'}}/>
                    </div>
                    <h3 id="modal-title" class="text-base font-semibold text-[#e7e7e7]">
                        Delete {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
                    </h3>
                </div>
                <button onclick={closeModal} disabled={isDeleting} class="p-1.5 rounded hover:bg-[#3c3c3c] transition-colors text-[#858585] hover:text-[#cccccc] disabled:opacity-50" aria-label="Close modal">
                    <CrossIconSvg options={{ class: 'w-5 h-5 stroke-admin-text-secondary stroke-[2]'}}/>
                </button>
            </div>

            <div class="px-5 py-4 flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <span class="text-xs font-semibold text-[#858585] uppercase tracking-wider">
                        Selected items
                    </span>
                    <div class="max-h-40 overflow-y-auto bg-[#1e1e1e] border border-[#3c3c3c] rounded">
                        {#each selectedItems as item}
                            <div class="flex items-center px-3 py-2 border-b border-[#3c3c3c] last:border-b-0">
                                <svg class="w-4 h-4 mr-2.5 text-[#858585] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <a 
                                    href={`items/item-details?itemId=${item.id}`}
                                    class="text-sm text-[#4fc1ff] hover:underline truncate"
                                >
                                    {item.itemName}
                                </a>
                            </div>
                        {/each}
                    </div>
                </div>

                <div class="flex gap-3 p-3 bg-[#5a1d1d]/20 border border-[#5a1d1d]/50 rounded">
                    <WarningIconSvg options={{ class: 'w-5 h-5 stroke-[#f48771] stroke-[2] flex-shrink-0 mt-0.5'}}/>
                    <div class="flex flex-col gap-1">
                        <span class="text-sm font-medium text-[#f48771]">This action is permanent</span>
                        <span class="text-xs text-[#cccccc]/80">
                            Deleted items cannot be recovered. Please make sure you want to proceed.
                        </span>
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <span class="text-sm text-[#cccccc]">
                        Type <span class="font-mono text-[#ce9178] bg-[#1e1e1e] px-1.5 py-0.5 rounded">{CONFIRMATION_TEXT}</span> to confirm
                    </span>
                    <input bind:value={currentInput} type="text" disabled={isDeleting} placeholder="permanently delete"
                        class="w-full px-3 py-2 bg-[#3c3c3c] border border-[#3c3c3c] rounded text-sm text-[#cccccc] placeholder-[#858585] outline-none transition-colors focus:border-[#007fd4] disabled:opacity-50"
                    />
                </div>
            </div>

            <div class="flex items-center justify-end gap-3 px-5 py-4 bg-[#2d2d2d] border-t border-[#3c3c3c]">
                <button 
                    onclick={closeModal}
                    disabled={isDeleting}
                    class="px-4 py-2 text-sm text-[#cccccc] bg-transparent border border-[#3c3c3c] rounded hover:bg-[#3c3c3c] transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button onclick={bulkItemDelete} disabled={!isConfirmed || isDeleting}
                    class="px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2
                           {isConfirmed && !isDeleting
                               ? 'bg-[#c53030] text-white hover:bg-[#e53e3e] cursor-pointer' 
                               : 'bg-[#3c3c3c] text-[#858585] cursor-not-allowed'}">
                    {#if isDeleting}
                        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                    {:else}
                        Delete {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
                    {/if}
                </button>
            </div>
        </div>
    </div>
{/if}