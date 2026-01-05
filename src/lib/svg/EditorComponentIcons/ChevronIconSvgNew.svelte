<script lang="ts">
	import type { svgArg } from '$lib/types/SvgIcon';

	let { options }: { options: svgArg } = $props();
</script>

<svg class={options.class}  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 18L15 12L9 6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
