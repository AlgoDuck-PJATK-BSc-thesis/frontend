<script lang="ts">
	export let className = '';
	export let side: 'left' | 'right' = 'left';
</script>

<div {...$$restProps} class={`relative inline-block rounded-[20px] ${className}`}>
	<div
		class="absolute top-0 right-[8px] left-[8px] h-[4px] bg-[color:var(--color-chat-border-{side})]"
	></div>
	<div
		class="absolute right-[8px] bottom-0 left-[8px] h-[4px] bg-[color:var(--color-chat-border-{side})]"
	></div>
	<div
		class="absolute top-[8px] bottom-[8px] left-0 w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></div>
	<div
		class="absolute top-[8px] right-0 bottom-[8px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></div>

	<span
		class="absolute top-[0px] left-[8px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>
	<span
		class="absolute top-[4px] left-[4px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>
	<span
		class="absolute top-[8px] left-[0px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>

	<span
		class="absolute top-[0px] right-[8px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>
	<span
		class="absolute top-[4px] right-[4px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>
	<span
		class="absolute top-[8px] right-[0px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>

	<span
		class="absolute bottom-[0px] left-[8px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>
	<span
		class="absolute bottom-[8px] left-[0px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>

	<span
		class="absolute right-[8px] bottom-[0px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>
	<span
		class="absolute right-[0px] bottom-[8px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-{side})]"
	></span>

	{#if side === 'left'}
		<div
			class="absolute -bottom-[0px] left-0 h-3 w-3"
			style="
				background: var(--color-chat-border-left);
				clip-path: polygon(100% 0%, 100% 100%, 0% 100%);
				transform: scaleX(-1);
			"
		></div>

		<span
			class="absolute right-[4px] bottom-[4px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-left)]"
		></span>
	{:else if side === 'right'}
		<div
			class="absolute right-0 -bottom-[0px] h-3 w-3"
			style="
				background: var(--color-chat-border-right);
				clip-path: polygon(100% 0%, 100% 100%, 0% 100%);
			"
		></div>
		<span
			class="absolute bottom-[4px] left-[4px] h-[4px] w-[4px] bg-[color:var(--color-chat-border-right)]"
		></span>
	{/if}

	<div class="relative z-10">
		<slot />
	</div>
</div>
