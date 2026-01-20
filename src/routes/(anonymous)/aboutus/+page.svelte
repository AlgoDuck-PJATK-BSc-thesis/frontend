<script lang="ts">
	import LandingPage from '$lib/Components/Misc/LandingPage.svelte';

	const images = Array.from({ length: 10 }, (_, i) => {
		const n = i + 1;
		return {
			src: `/aboutus/picture_${n}.png`,
			alt: `AlgoDuck screenshot ${n}`
		};
	});

	const githubUrl = 'https://github.com/AlgoDuck-PJATK-BSc-thesis';

	let openIndex = $state<number | null>(null);
	let dialogEl = $state<HTMLElement | null>(null);

	const open = (i: number) => {
		openIndex = i;
	};

	const close = () => {
		openIndex = null;
	};

	const prev = () => {
		if (openIndex === null) return;
		openIndex = (openIndex - 1 + images.length) % images.length;
	};

	const next = () => {
		if (openIndex === null) return;
		openIndex = (openIndex + 1) % images.length;
	};

	const onDialogKeyDown = (e: KeyboardEvent) => {
		if (openIndex === null) return;
		if (e.key === 'Escape') close();
		if (e.key === 'ArrowLeft') prev();
		if (e.key === 'ArrowRight') next();
	};

	$effect(() => {
		if (openIndex === null) return;
		if (typeof window === 'undefined') return;
		if (!dialogEl) return;
		queueMicrotask(() => dialogEl?.focus());
	});
</script>

<svelte:head>
	<title>About us - AlgoDuck</title>
</svelte:head>

<section class="relative h-[calc(100vh-4rem)] w-full overflow-hidden">
	<LandingPage />

	<div class="relative z-20 mx-auto mt-16 max-w-5xl px-4 text-center">
		<h1
			class="ocr-outline ocr-title isolate mt-0 mb-8 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			About Us
		</h1>

		<div
			class="relative z-10 mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[color:color-mix(in_srgb,var(--color-landingpage-title)_12%,transparent)] p-10 px-14 py-14 pt-10 pb-8 text-left text-[var(--color-input-text)] shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_0_1px_color-mix(in_srgb,var(--color-landingpage-title)_12%,transparent),inset_0_1px_0_0_color-mix(in_srgb,var(--color-landingpage-title)_18%,transparent)] backdrop-blur-3xl"
		>
			<div class="max-h-[calc(100vh-35rem)] w-full overflow-y-auto pr-2">
				<p
					class="text-base leading-relaxed opacity-95 [&_br]:mt-[0.35em] [&_br]:block [&_br]:content-['']"
				>
					We build AlgoDuck as a thesis project at Polish-Japanese Academy of Information Technology
					and as a product we genuinely wanted to have ourselves. The goal is simple: make learning
					algorithms feel structured, motivating, and transparent, whether someone is preparing for
					interviews or just wants to become a stronger engineer.
					<br />
					<br />
					AlgoDuck was built by people who have been through multiple stages of technical interviews
					at companies like Microsoft, Google, and Amazon. In those processes, solving problems is only
					part of the challenge. You are also expected to communicate clearly, justify trade-offs, and
					stay precise in a limited editor while several interviewers evaluate not only the final answer,
					but also the reasoning behind it. That experience made one thing very clear: algorithms are
					not a side topic in software engineering. They are a core skill that shapes who gets hired
					and why.
					<br />
					<br />
					Most modern interviews return to the same foundations. Arrays, hash maps, trees, heaps, and
					graphs show up again and again, just wrapped in different stories. The same goes for patterns
					like binary search, recursion, greedy reasoning, and dynamic programming. These topics matter
					because they reveal how someone thinks about efficiency, trade-offs, and edge cases. Frameworks
					change, but the ability to choose the right approach and explain it clearly stays valuable
					across languages and roles.
					<br />
					<br />
					At the same time, there is a real gap between understanding an idea and applying it quickly
					under interview conditions. Many people can follow a lecture or read a solution and feel confident,
					but struggle when they have to recognize the right data structure, design an approach, and
					implement it cleanly from scratch. Often the challenge is not the concept itself, but turning
					it into working code while staying organized and calm.
					<br />
					<br />
					AlgoDuck exists to make that transition smoother. We organize problems by topic and by recurring
					patterns so users build intuition, not just memorized solutions. We design progressions where
					constraints increase gradually, forcing better complexity and cleaner reasoning over time.
					Alongside practice, we provide interactive visualizations of algorithms and data structures,
					plus explanations and Java implementations that connect the idea to real, readable code.
					<br />
					<br />
					And because consistency matters, AlgoDuck is also meant to feel rewarding day to day. You earn
					coins by solving problems, collect ducks, and personalize your profile as you progress. Cohorts
					turn practice into a shared journey, where you can learn alongside others, compare solutions
					on leaderboards, exchange ideas, and keep each other accountable as your skills grow.
				</p>
			</div>

			<div class="mt-4 w-full">
				<div class="text-sm opacity-90">
					<a
						href={githubUrl}
						target="_blank"
						rel="noreferrer"
						class="mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-[color:color-mix(in_srgb,var(--color-landingpage-subtitle)_78%,transparent)] bg-[color:color-mix(in_srgb,var(--color-landingpage-subtitle)_14%,transparent)] px-4 py-2 text-[var(--color-input-text)] no-underline hover:bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_20%,transparent)]"
					>
						View the project on GitHub
						<span class="opacity-70">↗</span>
					</a>
				</div>
			</div>

			<div class="mt-6 w-full">
				<div class="mt-0 w-full overflow-x-auto pb-0.5">
					<div class="flex w-max gap-4 pr-2">
						{#each images as img, i (img.src)}
							<button
								type="button"
								class="group relative h-32 w-56 shrink-0 overflow-hidden rounded-2xl border-2 border-[color:color-mix(in_srgb,var(--color-landingpage-subtitle)_78%,transparent)] bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_6%,transparent)] focus:ring-2 focus:ring-[color:var(--color-primary)] focus:outline-none"
								aria-label={`Open screenshot ${i + 1}`}
								onclick={() => open(i)}
							>
								<img
									src={img.src}
									alt={img.alt}
									class="h-full w-full object-cover transition duration-150 group-hover:blur-[2px]"
									loading="lazy"
								/>
								<div
									class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
								>
									<div class="absolute inset-0 bg-black/30"></div>
									<div class="absolute inset-0 flex items-center justify-center">
										<div
											class="rounded-2xl border border-[color:color-mix(in_srgb,var(--color-landingpage-title)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_14%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--color-input-text)] backdrop-blur-2xl"
										>
											Click to expand
										</div>
									</div>
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if openIndex !== null}
		<div
			bind:this={dialogEl}
			class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
			role="dialog"
			aria-modal="true"
			aria-label="Image preview"
			tabindex="0"
			onkeydown={onDialogKeyDown}
		>
			<button
				type="button"
				class="absolute inset-0 h-full w-full cursor-default"
				aria-label="Close preview"
				onclick={close}
			></button>

			<div class="relative z-10 w-full max-w-5xl">
				<div
					class="relative overflow-hidden rounded-3xl border border-[color:color-mix(in_srgb,var(--color-landingpage-title)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_6%,transparent)] shadow-[0_20px_50px_rgba(0,0,0,0.45),inset_0_0_0_1px_color-mix(in_srgb,var(--color-landingpage-title)_10%,transparent)] backdrop-blur-3xl"
				>
					<img
						src={images[openIndex].src}
						alt={images[openIndex].alt}
						class="max-h-[80vh] w-full object-contain"
					/>
				</div>

				<div class="mt-4 flex items-center justify-between gap-3">
					<div class="text-sm text-[var(--color-input-text)] opacity-90">
						{openIndex + 1} / {images.length}
					</div>

					<div class="flex items-center gap-3">
						<button
							type="button"
							class="rounded-2xl border border-[color:color-mix(in_srgb,var(--color-landingpage-title)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_6%,transparent)] px-4 py-2 text-sm text-[var(--color-input-text)] hover:bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_10%,transparent)]"
							onclick={close}
							aria-label="Close preview"
						>
							Close
						</button>

						<button
							type="button"
							class="rounded-2xl border border-[color:color-mix(in_srgb,var(--color-landingpage-title)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_6%,transparent)] px-4 py-2 text-sm text-[var(--color-input-text)] hover:bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_10%,transparent)]"
							onclick={prev}
							aria-label="Previous image"
						>
							Prev
						</button>

						<button
							type="button"
							class="rounded-2xl border border-[color:color-mix(in_srgb,var(--color-landingpage-title)_12%,transparent)] bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_6%,transparent)] px-4 py-2 text-sm text-[var(--color-input-text)] hover:bg-[color:color-mix(in_srgb,var(--color-landingpage-title)_10%,transparent)]"
							onclick={next}
							aria-label="Next image"
						>
							Next
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>
