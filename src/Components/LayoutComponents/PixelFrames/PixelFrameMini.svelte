<script lang="ts">
	export let className = '';
</script>

<div {...$$restProps} class={`relative inline-block rounded-[12px] ${className}`}>
	<div class="absolute top-0 right-[6px] left-[6px] h-[3px] bg-[color:var(--color-accent-1)]"></div>
	<div
		class="absolute right-[6px] bottom-0 left-[6px] h-[3px] bg-[color:var(--color-accent-1)]"
	></div>
	<div
		class="absolute top-[6px] bottom-[6px] left-0 w-[3px] bg-[color:var(--color-accent-1)]"
	></div>
	<div
		class="absolute top-[6px] right-0 bottom-[6px] w-[3px] bg-[color:var(--color-accent-1)]"
	></div>

	<span class="absolute top-[0px] left-[6px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute top-[3px] left-[3px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute top-[6px] left-[0px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>

	<span class="absolute top-[0px] right-[6px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute top-[3px] right-[3px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute top-[6px] right-[0px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>

	<span class="absolute bottom-[0px] left-[6px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute bottom-[3px] left-[3px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute bottom-[6px] left-[0px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>

	<span class="absolute right-[6px] bottom-[0px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute right-[3px] bottom-[3px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>
	<span class="absolute right-[0px] bottom-[6px] h-[3px] w-[3px] bg-[color:var(--color-accent-1)]"
	></span>

	<div class="relative z-10 pt-1 pb-1">
		<slot />
	</div>
</div>
