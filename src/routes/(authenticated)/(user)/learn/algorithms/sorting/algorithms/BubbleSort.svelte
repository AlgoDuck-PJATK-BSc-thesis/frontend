<script lang="ts">
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/bubble.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	type Item = { id: number; value: number };
	type Step = {
		items: Item[];
		a: number;
		b: number;
		sortedFrom: number;
		note: string;
		swapped: boolean;
	};

	const initialValues = [64, 34, 25, 12, 22, 11, 90];
	const n0 = initialValues.length;

	function makeItems(values: number[]): Item[] {
		return values.map((v, i) => ({ id: i, value: v }));
	}

	function snapshot(a: Item[]) {
		return a.slice();
	}

	let items = $state<Item[]>(makeItems(initialValues));
	let running = $state(false);

	let activeA = $state(-1);
	let activeB = $state(-1);
	let sortedFrom = $state(n0);
	let status = $state('Ready.');

	let intervalId: ReturnType<typeof setInterval> | null = null;

	let maxVal = $derived(Math.max(1, ...items.map((x) => x.value)));

	function heightFor(v: number) {
		return Math.max(60, Math.round((v / maxVal) * 220));
	}

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		running = false;
		items = makeItems(initialValues);
		activeA = -1;
		activeB = -1;
		sortedFrom = n0;
		status = 'Ready.';
	}

	function buildSteps(start: Item[]): Step[] {
		const a = start.slice();
		const steps: Step[] = [];
		const n = a.length;

		for (let i = 0; i < n - 1; i++) {
			let swappedPass = false;
			const bound = n - i - 1;

			for (let j = 0; j < bound; j++) {
				steps.push({
					items: snapshot(a),
					a: j,
					b: j + 1,
					sortedFrom: n - i,
					note: `Compare ${a[j].value} and ${a[j + 1].value}`,
					swapped: false
				});

				if (a[j].value > a[j + 1].value) {
					const t = a[j];
					a[j] = a[j + 1];
					a[j + 1] = t;

					swappedPass = true;

					steps.push({
						items: snapshot(a),
						a: j,
						b: j + 1,
						sortedFrom: n - i,
						note: 'Swap',
						swapped: true
					});
				}
			}

			if (!swappedPass) break;
		}

		steps.push({
			items: snapshot(a),
			a: -1,
			b: -1,
			sortedFrom: 0,
			note: 'Done.',
			swapped: false
		});

		return steps;
	}

	function run() {
		if (running) return;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		running = true;
		const steps = buildSteps(items);

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				const s = steps[idx];
				items = s.items;
				activeA = s.a;
				activeB = s.b;
				sortedFrom = s.sortedFrom;
				status = s.note;
				idx += 1;
			} else {
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
				running = false;
				activeA = -1;
				activeB = -1;
				sortedFrom = 0;
				status = 'Done.';
			}
		}, 420);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-8 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-lg font-bold text-white">Bubble Sort</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Compares adjacent elements and swaps them until the largest values reaches the end.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="mb-3 text-center text-xs text-[color:var(--color-landingpage-subtitle)]">
					{status}
				</div>

				<div class="flex items-end justify-center gap-2" style="height: 260px;">
					{#each items as it, i (it.id)}
						<div
							animate:flip={{ duration: 320 }}
							class={[
								'w-12 rounded-t-lg border border-white/10 text-center text-sm font-bold text-white',
								i >= sortedFrom ? 'bg-emerald-600/45' : 'bg-white/10',
								i === activeA || i === activeB ? 'ring-2 ring-cyan-300/70' : ''
							].join(' ')}
							style={`height:${heightFor(it.value)}px;`}
						>
							<div class="mt-2">{it.value}</div>
						</div>
					{/each}
				</div>

				<div class="mt-5 flex flex-wrap justify-center gap-3">
					<button
						type="button"
						onclick={run}
						disabled={running}
						class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
					>
						<Icons name="play" />
						<span>Run</span>
					</button>

					<button
						type="button"
						onclick={reset}
						class="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-5 py-2 font-semibold text-white"
					>
						<Icons name="reset" />
						<span>Reset</span>
					</button>
				</div>
			</div>
		</div>

		<CodePanel {meta} {java} />
	</div>
</PixelFrameSimple>
