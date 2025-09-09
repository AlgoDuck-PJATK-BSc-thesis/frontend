<script lang="ts">
	import { onMount } from 'svelte';

	type ThemeType = 'light' | 'dark';

	export let ontoggle: () => void;
	export let imagesPath = '/buttons';

	let currentTheme: ThemeType = 'light';
	let isPressed = false;

	$: restPath = `${imagesPath}/${currentTheme}/square/${currentTheme === 'light' ? 'Jasny' : 'Ciemny'}_guzik_kwadratowy1.png`;
	$: hoverPath = `${imagesPath}/${currentTheme}/square/${currentTheme === 'light' ? 'Jasny' : 'Ciemny'}_guzik_kwadratowy2.png`;

	function triggerToggle() {
		isPressed = !isPressed;
		ontoggle?.();
	}

	onMount(() => {
		currentTheme = (document.documentElement.getAttribute('data-theme') as ThemeType) || 'light';
		const observer = new MutationObserver(() => {
			currentTheme = (document.documentElement.getAttribute('data-theme') as ThemeType) || 'light';
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		return () => observer.disconnect();
	});
</script>

<button
	onclick={triggerToggle}
	aria-label="Accessibility options"
	aria-pressed={isPressed}
	title="Accessibility options"
	class="group fixed right-10 bottom-10 z-[999] border-none bg-transparent p-0"
>
	<img
		src={restPath}
		alt=""
		class="pointer-events-none opacity-100 transition-opacity duration-100 group-hover:opacity-0"
		draggable="false"
	/>
	<img
		src={hoverPath}
		alt=""
		class="pointer-events-none absolute bottom-0 left-0 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
		draggable="false"
	/>
	<span
		class="pointer-events-none absolute inset-0 z-10 flex translate-y-[-2px] items-center justify-center transition-transform duration-100 group-hover:translate-y-[2px]"
	>
		<img
			src="/buttons/Accesibility.png"
			alt="Accessibility"
			class="h-7 w-6 -translate-y-[1px] transform select-none group-hover:-translate-y-[2px]"
			draggable="false"
		/>
	</span>
</button>
