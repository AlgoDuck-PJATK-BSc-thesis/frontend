<script lang="ts">
	import type { svgArg } from "$lib/types/SvgIcon";

	let { options }: { options: svgArg } = $props();
</script>

<svg class="{options.class}" fill="none" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>