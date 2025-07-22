<script lang="ts">
	import { animate } from 'motion';
	import type { SpringOptions } from 'motion';

	let {
		expanded = false,
		width = 28,
		height = 28,
		strokeWidth = 2,
		stroke = '#ffffff',
		ontoggle
	} = $props();

	let path1: SVGPathElement;
	let path2: SVGPathElement;
	let path3: SVGPathElement;
	let path4: SVGPathElement;

	function toggle() {
		ontoggle?.();
		const to = expanded ? 'animate' : 'normal';
		runAnimation(to);
	}

	function runAnimation(state: 'animate' | 'normal') {
		const map = {
			animate: [
				{ x: 2, y: 2 },
				{ x: -2, y: 2 },
				{ x: 2, y: -2 },
				{ x: -2, y: -2 }
			],
			normal: [
				{ x: 0, y: 0 },
				{ x: 0, y: 0 },
				{ x: 0, y: 0 },
				{ x: 0, y: 0 }
			]
		};

		const transition: SpringOptions = {
			stiffness: 400,
			damping: 20
		};

		animate(path1, map[state][0] as any, transition);
		animate(path2, map[state][1] as any, transition);
		animate(path3, map[state][2] as any, transition);
		animate(path4, map[state][3] as any, transition);

	}
</script>

<button
	type="button"
	onclick={toggle}
	title="Expand/Collapse the Pond"
	aria-pressed={expanded}
	aria-label={expanded ? 'Collapse view' : 'Expand view'}
	class="cursor-pointer select-none p-2 flex items-center justify-center bg-[color:var(--color-primary)] text-white rounded-md text-xs z-50 fixed top-20 right-8"
>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		{width}
		{height}
		viewBox="0 0 24 24"
		fill="none"
		stroke={stroke}
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path
			bind:this={path1}
			d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"
		/>
		<path
			bind:this={path2}
			d="M3 16.2V21m0 0h4.8M3 21l6-6"
		/>
		<path
			bind:this={path3}
			d="M21 7.8V3m0 0h-4.8M21 3l-6 6"
		/>
		<path
			bind:this={path4}
			d="M3 7.8V3m0 0h4.8M3 3l6 6"
		/>
	</svg>
</button>
