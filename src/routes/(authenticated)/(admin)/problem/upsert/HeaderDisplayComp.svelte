<script lang="ts">
	import type { DisplayCompArgs } from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelectOptions";
	import type { HeaderOptions } from "./TestCase";

    let { options }: { options: DisplayCompArgs<HeaderOptions> } = $props();
</script>

<main class="w-32 h-7 flex justify-center bg-[#2d2d2d] px-1 py-0.5 items-center">
    <span class="h-full w-full rounded-md {options.isSelected ?  "bg-[#3c3c3c]" : "hover:bg-[#3c3c3c]"}">{options.content.label}</span>
</main>