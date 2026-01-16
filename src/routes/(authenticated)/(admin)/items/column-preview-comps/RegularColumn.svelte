<script lang='ts'>
	import type { ColumnPreviewArgs } from "./columnPreviewArgs";

    let { options }: { options: ColumnPreviewArgs } = $props();
</script>

<div class="w-full flex justify-center text-xs">
    <span>{options.label}</span>
</div>