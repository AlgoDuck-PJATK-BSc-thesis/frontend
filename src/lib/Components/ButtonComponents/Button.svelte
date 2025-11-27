<script lang="ts">
	import { onMount } from 'svelte';

	type SizeType = 'small' | 'medium' | 'big' | 'square' | 'bigger';
	type ThemeType = 'light' | 'dark';
	type TrackingType = 'normal' | 'wide' | 'wider' | 'widest' | 'extra';

	let {
		size = 'medium',
		onclick,
		imagesPath = '/buttons',
		label = '',
		labelColor = 'white',
		labelFontSize = '0.875rem',
		labelFontFamily = 'inherit',
		labelFontWeight = 'normal',
		labelClass = '',
		labelTracking = 'normal'
	} = $props<{
		size?: SizeType;
		onclick?: () => void;
		imagesPath?: string;
		label?: string;
		labelColor?: string;
		labelFontSize?: string;
		labelFontFamily?: string;
		labelFontWeight?: string;
		labelClass?: string;
		labelTracking?: TrackingType;
	}>();

	let currentTheme = $state<ThemeType>('light');

	onMount(() => {
		currentTheme = (document.documentElement.getAttribute('data-theme') as ThemeType) || 'light';

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
			size === 'big'
				? 'duzy'
				: size === 'medium'
					? 'sredni'
					: size === 'small'
						? 'maly'
						: size === 'bigger'
							? 'najwiekszy'
							: 'kwadratowy';
		return `${imagesPath}/${currentTheme}/${size}/${color}_guzik_${sizeName}1.png`;
	});

	const hoverPath = $derived(() => {
		const color = currentTheme === 'light' ? 'Jasny' : 'Ciemny';
		const sizeName =
			size === 'big'
				? 'duzy'
				: size === 'medium'
					? 'sredni'
					: size === 'small'
						? 'maly'
						: size === 'bigger'
							? 'najwiekszy'
							: 'kwadratowy';
		return `${imagesPath}/${currentTheme}/${size}/${color}_guzik_${sizeName}2.png`;
	});

	const labelColorClass = $derived(() => {
		return labelColor.startsWith('[') ? labelColor : '';
	});

	const labelColorStyle = $derived(() => {
		return labelColor.startsWith('[') ? '' : `color: ${labelColor};`;
	});

	const trackingClassMap: Record<TrackingType, string> = {
		normal: '',
		wide: 'tracking-wide',
		wider: 'tracking-wider',
		widest: 'tracking-widest',
		extra: 'tracking-[0.25em]'
	};

	const labelTrackingClass = $derived(() => trackingClassMap[labelTracking as TrackingType] ?? '');
</script>

<button
	{onclick}
	class="group relative cursor-pointer border-none bg-transparent p-0"
	aria-label={label}
>
	<img
		src={restPath()}
		alt=""
		class="pointer-events-none opacity-100 transition-opacity duration-100 group-hover:opacity-0"
		draggable="false"
	/>

	<img
		src={hoverPath()}
		alt=""
		class="pointer-events-none absolute bottom-0 left-0 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
		draggable="false"
	/>

	{#if label}
		<span
			class={`pointer-events-none absolute inset-0 z-10 flex translate-y-[-4px] items-center justify-center transition-transform duration-50 select-none group-hover:translate-y-[4px] ${labelTrackingClass()} ${labelColorClass()} ${labelClass}`}
			style={`font-size: ${labelFontSize}; font-family: ${labelFontFamily}; font-weight: ${labelFontWeight}; ${labelColorStyle()}`}
		>
			{label}
		</span>
	{/if}
</button>
