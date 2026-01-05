<script lang='ts'>
	import type { DisplayCompArgs } from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelectOptions";
	import type { CategoryDto } from "../problemAddTypes";

    let { options }: { options: DisplayCompArgs<CategoryDto> } = $props();
</script>

<main class="w-120 max-w-[40vw] py-0.5 px-1 h-10 flex items-center justify-center bg-admin-bg-tertiary">
    <div class="w-full h-full flex items-center justify-center rounded-sm {options.isSelected ? "bg-admin-bg-input":"hover:bg-admin-bg-input/50"}">
        <span>{options.content.categoryName}</span>
    </div>
</main>