
<script lang='ts'>
	import { clickOutside } from "$lib/actions/clickOutside";
	import Toggle from "../items/Toggle.svelte";
	import type { QueryableColumn } from "./problemTypes";

    let { columnPicker, isVisible = $bindable(), updateColumnSelection }: { columnPicker: Record<QueryableColumn, boolean>, isVisible: boolean, updateColumnSelection: ((columnPicker: Record<QueryableColumn, boolean>) => void) } = $props()

    let columnPickerLocal: Record<QueryableColumn, boolean> = $state(columnPicker);

    const toggleColumn = (column: QueryableColumn) => {
        columnPickerLocal[column] = !columnPickerLocal[column]; 
    }
</script>
<!-- svelte-ignore a11y_click_events_have_key_events - not actually a button, doesn't do anything real on click -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<main use:clickOutside={() => isVisible = false} onclick={(e) => e.stopPropagation()} class="w-50 bg-admin-bg-secondary border-admin-border-primary rounded-md border-1 flex flex-col gap-2 p-2">
    <h3 class="font-bold text-md">
        Select visible columns
    </h3>

    {#each Object.keys(columnPicker) as QueryableColumn[] as column}
        <div class="w-full px-2 flex flex-row justify-between items-center">
            <div class="w-8 h-4">
                <Toggle toggled={columnPickerLocal[column]} toggle={() => {
                    toggleColumn(column);
                    updateColumnSelection(columnPickerLocal);
                }}/> 
            </div>
            <span class="text-[9px]">{column}</span>
        </div>
    {/each}
</main>