<script lang="ts">
	import type { svgArg } from "$lib/types/SvgIcon";



	let { args }: { args: svgArg } = $props();
</script>

<svg class="h-[70%] aspect-square mr-[5%]" viewBox="0 0 32 32">
	<line class="st0" x1="16" y1="20" x2="16" y2="4" style="stroke: {args.color};" />
	<polyline class="st0" points="12,8 16,4 20,8 " style="stroke: {args.color};" />
	<polyline
		class="st0"
		points="9,13 3,16.5 3,21.5 16,29 29,21.5 29,16.5 23,13 "
		style="stroke: {args.color};"
	/>
</svg>

<style type="text/css">
	.st0 {
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-miterlimit: 10;
	}
</style>
