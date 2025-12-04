<script lang="ts">
	import type { svgArg } from "$lib/types/SvgIcon";

	let { options }: { options: svgArg } = $props();
</script>

<svg  class="{options.class}" fill="none" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>