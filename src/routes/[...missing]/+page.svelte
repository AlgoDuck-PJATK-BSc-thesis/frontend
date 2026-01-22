<svelte:head>
	<title>404 - Not Found</title>
</svelte:head>

<section
	class="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-6"
>
	<img
		src="/Loading.gif"
		alt="Loading"
		class="pointer-events-none absolute top-1/2 left-0 z-0 h-[46rem] w-[46rem] -translate-x-[25%] -translate-y-1/2 object-contain opacity-90 select-none"
		decoding="async"
		loading="eager"
		draggable="false"
	/>

	<img
		src="/Loading.gif"
		alt="Loading"
		class="pointer-events-none absolute top-1/2 right-0 z-0 h-[46rem] w-[46rem] translate-x-[25%] -translate-y-1/2 object-contain opacity-90 select-none"
		decoding="async"
		loading="eager"
		draggable="false"
	/>

	<div class="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			404
		</h1>

		<h2 class="mt-0 mb-2 text-lg font-semibold text-[color:var(--color-primary)]">Not Found</h2>

		<p class="max-w-md text-sm text-[color:var(--color-text)] opacity-80">
			The page you are looking for does not exist.
		</p>

		<div class="mt-8">
			<a
				href="/home"
				class="rounded-2xl border border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text)] hover:brightness-110"
			>
				Go home
			</a>
		</div>
	</div>
</section>
