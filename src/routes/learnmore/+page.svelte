<script>
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
</script>

<svelte:head>
	<title>Learn more - AlgoDuck</title>
</svelte:head>

<section class="mx-auto mt-16 max-w-4xl px-4">
	<h1
		class="isolate mt-2 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl
       font-black tracking-widest text-[var(--color-primary)]
       shadow-none drop-shadow-none filter-none backdrop-filter-none
       [--dx:6px] [--dy:4px] [--stroke:5px]
       [-webkit-text-stroke-color:var(--shadow-header)]
       [-webkit-text-stroke-width:var(--stroke)]
       [paint-order:stroke_fill]
       [text-shadow:var(--dx)_var(--dy)_0_var(--shadow-header)]
       supports-[not(-webkit-text-stroke:1px_black)]:[text-shadow:var(--dx)_var(--dy)_0_var(--shadow-header),0_1px_0_var(--shadow-header),0_-1px_0_var(--shadow-header),1px_0_0_var(--shadow-header),-1px_0_0_var(--shadow-header),1px_1px_0_var(--shadow-header),1px_-1px_0_var(--shadow-header),-1px_1px_0_var(--shadow-header),-1px_-1px_0_var(--shadow-header),0_2px_0_var(--shadow-header),0_-2px_0_var(--shadow-header),2px_0_0_var(--shadow-header),-2px_0_0_var(--shadow-header),2px_2px_0_var(--shadow-header),2px_-2px_0_var(--shadow-header),-2px_2px_0_var(--shadow-header),-2px_-2px_0_var(--shadow-header)]"
	>
		How Beetcode works
	</h1>

	<PixelFrame
		className="flex w-full flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] px-10 pt-10 pb-12"
	>
		<ol class="flex list-none flex-col gap-8 p-0">
			<li>
				<h2 class="mb-2 text-xl font-semibold text-[color:var(--color-accent-2)]">1. Sign up</h2>
				<p class="text-base leading-relaxed text-[color:var(--color-text)]">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc a metus vitae lorem
					facilisis bibendum.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold text-[color:var(--color-accent-2)]">
					2. Choose a challenge
				</h2>
				<p class="text-base leading-relaxed text-[color:var(--color-text)]">
					Sed non risus id purus congue rutrum. Duis vel dapibus erat, sed tristique tellus.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold text-[color:var(--color-accent-2)]">
					3. Collect ducks!
				</h2>
				<p class="text-base leading-relaxed text-[color:var(--color-text)]">
					Phasellus nec metus sed lorem sodales gravida. Etiam ut nisi nec nisl fermentum congue.
				</p>
			</li>
			<li>
				<h2 class="mb-2 text-xl font-semibold text-[color:var(--color-accent-2)]">
					4. Track your progress
				</h2>
				<p class="text-base leading-relaxed text-[color:var(--color-text)]">
					Aenean a erat et nisl euismod rhoncus nec a justo. Suspendisse potenti.
				</p>
			</li>
		</ol>
	</PixelFrame>
</section>
