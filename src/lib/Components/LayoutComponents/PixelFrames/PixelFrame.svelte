<script lang="ts">
	export let className = '';
</script>

<div {...$$restProps} class={`relative  rounded-[20px] ${className}`}>
	<div class="absolute top-0 right-[8px] left-[8px] h-[4px] bg-[color:var(--color-accent-1)]"></div>
	<div
		class="absolute right-[8px] bottom-0 left-[8px] h-[4px] bg-[color:var(--color-accent-1)]"
	></div>
	<div
		class="absolute top-[8px] bottom-[8px] left-0 w-[4px] bg-[color:var(--color-accent-1)]"
	></div>
	<div
		class="absolute top-[8px] right-0 bottom-[8px] w-[4px] bg-[color:var(--color-accent-1)]"
	></div>

	<span class="absolute top-[0px] left-[8px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute top-[4px] left-[4px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute top-[8px] left-[0px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>

	<span class="absolute top-[0px] right-[8px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute top-[4px] right-[4px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute top-[8px] right-[0px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>

	<span class="absolute bottom-[0px] left-[8px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute bottom-[4px] left-[4px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute bottom-[8px] left-[0px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>

	<span class="absolute right-[8px] bottom-[0px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute right-[4px] bottom-[4px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute right-[0px] bottom-[8px] h-[4px] w-[4px] bg-[color:var(--color-accent-1)]"
	></span>

	{#each Array(3) as _, i}
		<span class="absolute h-[4px] w-[4px] bg-white/50" style="top: 4px; left: {8 + i * 4}px"></span>
	{/each}

	{#each Array(3) as _, i}
		<span class="absolute h-[4px] w-[4px] bg-white/50" style="top: {8 + i * 4}px; left: 4px"></span>
	{/each}

	{#each Array(3) as _, i}
		<span class="absolute h-[4px] w-[4px] bg-white/50" style="top: 4px; right: {8 + i * 4}px"
		></span>
	{/each}

	{#each Array(3) as _, i}
		<span class="absolute h-[4px] w-[4px] bg-white/50" style="top: {8 + i * 4}px; right: 4px"
		></span>
	{/each}

	{#each Array(3) as _, i}
		<span class="absolute h-[4px] w-[4px] bg-white/50" style="bottom: 4px; left: {8 + i * 4}px"
		></span>
	{/each}

	{#each Array(3) as _, i}
		<span class="absolute h-[4px] w-[4px] bg-white/50" style="bottom: {8 + i * 4}px; left: 4px"
		></span>
	{/each}

	{#each Array(3) as _, i}
		<span class="absolute h-[4px] w-[4px] bg-white/50" style="bottom: 4px; right: {8 + i * 4}px"
		></span>
	{/each}

	{#each Array(3) as _, i}
		<span class="absolute h-[4px] w-[4px] bg-white/50" style="bottom: {8 + i * 4}px; right: 4px"
		></span>
	{/each}
	<div class="relative z-10">
		<slot />
	</div>
</div>
