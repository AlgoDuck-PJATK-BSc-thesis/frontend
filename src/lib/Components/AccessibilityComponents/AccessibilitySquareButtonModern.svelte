<script lang="ts">
	export let ontoggle: () => void;

	let isAnimated = false;

	function triggerAnimation() {
		isAnimated = true;
		ontoggle?.();
	}
</script>

<button
	onclick={triggerAnimation}
	aria-label="Accessibility options"
	aria-pressed={isAnimated}
	title="Accessibility options"
	class="fixed right-10 bottom-10 z-[999] flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--color-accent-1)] bg-[color:var(--color-primary)] text-[color:var(--color-bg)] shadow-[0_18px_40px_rgba(0,0,0,0.20)] transition hover:brightness-95 active:scale-95"
>
	<img
		src="/buttons/Accesibility.png"
		alt="Accessibility"
		class="h-7 w-7 object-contain"
		draggable="false"
	/>
</button>
