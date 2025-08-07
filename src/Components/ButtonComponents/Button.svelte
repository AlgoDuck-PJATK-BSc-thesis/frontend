<script lang="ts">
	import { onMount } from 'svelte';

	type SizeType = 'small' | 'medium' | 'big';
	type ThemeType = 'light' | 'dark';

	let {
		size = 'medium',
		onclick,
		imagesPath = '/buttons',
		label = '',
		labelColor = 'white',
		labelFontSize = '0.875rem',
		labelFontFamily = 'inherit',
		labelFontWeight = 'normal'
	} = $props<{
		size?: SizeType;
		onclick?: () => void;
		imagesPath?: string;
		label?: string;
		labelColor?: string;
		labelFontSize?: string;
		labelFontFamily?: string;
		labelFontWeight?: string;
	}>();

	let currentTheme = $state<ThemeType>('light');

	onMount(() => {
		currentTheme = document.documentElement.getAttribute('data-theme') as ThemeType || 'light';

		const observer = new MutationObserver(() => {
			const themeAttr = document.documentElement.getAttribute('data-theme') as ThemeType;
			currentTheme = themeAttr || 'light';
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});

		return () => observer.disconnect();
	});

	const restPath = $derived(() => {
		const color = currentTheme === 'light' ? 'Jasny' : 'Ciemny';
		const sizeName =
			size === 'big' ? 'duzy' : size === 'medium' ? 'sredni' : 'maly';
		return `${imagesPath}/${currentTheme}/${size}/${color}_guzik_${sizeName}1.png`;
	});

	const hoverPath = $derived(() => {
		const color = currentTheme === 'light' ? 'Jasny' : 'Ciemny';
		const sizeName =
			size === 'big' ? 'duzy' : size === 'medium' ? 'sredni' : 'maly';
		return `${imagesPath}/${currentTheme}/${size}/${color}_guzik_${sizeName}2.png`;
	});

	const labelColorClass = $derived(() => {
		return labelColor.startsWith('[') ? labelColor : '';
	});

	const labelColorStyle = $derived(() => {
		return labelColor.startsWith('[') ? '' : `color: ${labelColor};`;
	});
</script>

<button
	onclick={onclick}
	class="group relative border-none bg-transparent cursor-pointer p-0"
	aria-label={label}
>
	<img
		src={restPath()}
		alt=""
		class="pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-100"
		draggable="false"
	/>

	<img
		src={hoverPath()}
		alt=""
		class="absolute bottom-0 left-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-100"
		draggable="false"
	/>

	{#if label}
		<span
			class={`absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none transition-transform duration-100 translate-y-[-3px] group-hover:translate-y-[2px] ${labelColorClass()}`}
			style={`font-size: ${labelFontSize}; font-family: ${labelFontFamily}; font-weight: ${labelFontWeight}; ${labelColorStyle()}`}
		>
			{label}
		</span>
	{/if}
</button>