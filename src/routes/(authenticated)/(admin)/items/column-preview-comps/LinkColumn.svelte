<script lang='ts'>
	import type { LinkPreviewColumnArgs } from "./columnPreviewArgs";

    let { options }: { options: LinkPreviewColumnArgs } = $props();
</script>


<div class="w-full flex justify-start px-4 items-center">
    <a href={options.href}
    class="text-xs text-admin-accent-link hover:underline">
        {options.label}
    </a>
</div>