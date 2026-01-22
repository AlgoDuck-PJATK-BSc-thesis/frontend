<script lang="ts">
	import type { BgSegment } from '../types';

	let { bgHeight, segments } = $props<{ bgHeight: number; segments: BgSegment[] }>();
</script>

<div class="absolute top-0 left-0 z-0 w-full overflow-hidden" style={`height:${bgHeight}px;`}>
	<div class="relative w-full" style={`height:${bgHeight}px;`}>
		{#each segments as seg (seg.top)}
			<img
				src={seg.src}
				alt=""
				aria-hidden="true"
				class="pointer-events-none absolute left-0 w-full object-cover select-none"
				style={`top:${seg.top}px;height:${seg.h}px;`}
			/>
		{/each}
	</div>
</div>
