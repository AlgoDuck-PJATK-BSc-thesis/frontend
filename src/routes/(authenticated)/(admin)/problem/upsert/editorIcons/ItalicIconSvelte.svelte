<script lang="ts">
	import type { svgArg } from '$lib/types/SvgIcon';

	let { options }: { options: svgArg } = $props();
</script>


<svg class={options.class}  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M19 4H10M14 20H5M15 4L9 20" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
