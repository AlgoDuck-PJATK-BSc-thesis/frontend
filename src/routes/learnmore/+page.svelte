<script>
	import PixelFrame from '../../Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
</script>

<svelte:head>
	<title>Learn more – Beetcode</title>
</svelte:head>

<section class="mx-auto mt-16 max-w-4xl px-4">
	<h1
		class="mb-10 text-center text-6xl text-[color:var(--color-primary)]"
		style="font-family: var(--font-ariw9500);"
	>
		How Beetcode works
	</h1>

	<PixelFrame
		className="flex w-full flex-col items-center bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))] px-10 pt-10 pb-12"
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
