<script lang="ts">
	import type { svgArg } from "$lib/types/SvgIcon";
	let { options }: { options: svgArg } = $props();
</script>

<svg class="{options.class ?? 'w-6 h-6'}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18 16L22 12L18 8M6 8L2 12L6 16M14.5 4L9.5 20" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
