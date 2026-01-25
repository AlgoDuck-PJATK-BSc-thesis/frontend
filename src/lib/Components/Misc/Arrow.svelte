<script>
	let {
		size = 24,
		stroke = 'currentColor',
		strokeWidth = 2,
		class: className = '',
		...rest
	} = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
	{...rest}
>
	<path
		d="M18 8L22 12M22 12L18 16M22 12H2"
		{stroke}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
