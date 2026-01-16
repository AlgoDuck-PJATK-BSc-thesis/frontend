<script lang="ts">
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/quick.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	type Item = { id: number; value: number };
	type Step = {
		items: Item[];
		i: number;
		j: number;
		pivot: number;
		lo: number;
		hi: number;
		note: string;
	};

	const initialValues = [10, 7, 8, 9, 1, 5];
	const n0 = initialValues.length;

	function makeItems(values: number[]): Item[] {
		return values.map((v, i) => ({ id: i, value: v }));
	}

	function snapshot(a: Item[]) {
		return a.slice();
	}

	let items = $state<Item[]>(makeItems(initialValues));
	let running = $state(false);

	let iPtr = $state(-1);
	let jPtr = $state(-1);
	let pivotIdx = $state(-1);
	let rangeLo = $state(0);
	let rangeHi = $state(n0 - 1);
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
		iPtr = -1;
		jPtr = -1;
		pivotIdx = -1;
		rangeLo = 0;
		rangeHi = n0 - 1;
		status = 'Ready.';
	}

	function buildSteps(start: Item[]): Step[] {
		const a = start.slice();
		const steps: Step[] = [];

		function swap(x: number, y: number) {
			const t = a[x];
			a[x] = a[y];
			a[y] = t;
		}

		function partition(lo: number, hi: number) {
			const pivot = a[hi].value;
			let i = lo;

			steps.push({ items: snapshot(a), i, j: -1, pivot: hi, lo, hi, note: `Pivot = ${pivot}` });

			for (let j = lo; j < hi; j++) {
				steps.push({
					items: snapshot(a),
					i,
					j,
					pivot: hi,
					lo,
					hi,
					note: `Compare ${a[j].value} with pivot`
				});

				if (a[j].value < pivot) {
					if (i !== j) {
						swap(i, j);
						steps.push({
							items: snapshot(a),
							i,
							j,
							pivot: hi,
							lo,
							hi,
							note: 'Swap into left partition'
						});
					}
					i += 1;
				}
			}

			swap(i, hi);
			steps.push({ items: snapshot(a), i, j: hi, pivot: i, lo, hi, note: 'Place pivot' });
			return i;
		}

		function quick(lo: number, hi: number) {
			if (lo >= hi) return;
			const p = partition(lo, hi);
			quick(lo, p - 1);
			quick(p + 1, hi);
		}

		quick(0, a.length - 1);
		steps.push({
			items: snapshot(a),
			i: -1,
			j: -1,
			pivot: -1,
			lo: 0,
			hi: a.length - 1,
			note: 'Done.'
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
				iPtr = s.i;
				jPtr = s.j;
				pivotIdx = s.pivot;
				rangeLo = s.lo;
				rangeHi = s.hi;
				status = s.note;
				idx += 1;
			} else {
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
				running = false;
				iPtr = -1;
				jPtr = -1;
				pivotIdx = -1;
				rangeLo = 0;
				rangeHi = n0 - 1;
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
			<div class="text-lg font-bold text-white">Quick Sort</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Partition around a pivot, then recursively sort partitions.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="mb-3 text-center text-xs text-[color:var(--color-landingpage-subtitle)]">
					{status}
				</div>

				<div class="flex items-end justify-center gap-2" style="height: 260px;">
					{#each items as it, idx (it.id)}
						<div
							animate:flip={{ duration: 320 }}
							class={[
								'w-14 rounded-t-lg border border-white/10 text-center text-sm font-bold text-white',
								idx >= rangeLo && idx <= rangeHi ? 'bg-white/10' : 'bg-white/5',
								idx === pivotIdx ? 'ring-2 ring-red-300/70' : '',
								idx === iPtr ? 'ring-2 ring-cyan-300/70' : '',
								idx === jPtr ? 'ring-2 ring-amber-300/70' : ''
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
						class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
