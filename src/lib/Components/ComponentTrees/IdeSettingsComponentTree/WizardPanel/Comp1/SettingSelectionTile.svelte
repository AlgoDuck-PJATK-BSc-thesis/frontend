<script lang="ts">
	import type { DisplayCompArgs } from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelectOptions";


    export type SettingSelectionTileArgs = {
        value: string
    }
    let { options }: { options: DisplayCompArgs<SettingSelectionTileArgs> } = $props();
</script>

<main class="w-50 h-12 px-1 py-0.5 bg-ide-card">
    <div class="flex flex-row justify-center rounded-md items-center w-full h-full {options.isSelected ? "bg-ide-dcard" : "bg-ide-card hover:bg-ide-dcard"}">
        {options.content.value}
    </div>
</main>