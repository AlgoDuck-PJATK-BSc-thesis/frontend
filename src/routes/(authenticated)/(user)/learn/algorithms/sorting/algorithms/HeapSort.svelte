<script lang="ts">
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/heap.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	type Item = { id: number; value: number };
	type Step = { items: Item[]; a: number; b: number; sortedFrom: number; note: string };

	const initialValues = [12, 11, 13, 5, 6, 7];
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

		function swap(i: number, j: number) {
			const t = a[i];
			a[i] = a[j];
			a[j] = t;
		}

		function heapify(heapSize: number, i: number) {
			while (true) {
				const l = 2 * i + 1;
				const r = 2 * i + 2;
				let best = i;

				if (l < heapSize) {
					steps.push({
						items: snapshot(a),
						a: best,
						b: l,
						sortedFrom: heapSize,
						note: 'Compare parent vs left'
					});
					if (a[l].value > a[best].value) best = l;
				}

				if (r < heapSize) {
					steps.push({
						items: snapshot(a),
						a: best,
						b: r,
						sortedFrom: heapSize,
						note: 'Compare best vs right'
					});
					if (a[r].value > a[best].value) best = r;
				}

				if (best !== i) {
					swap(i, best);
					steps.push({
						items: snapshot(a),
						a: i,
						b: best,
						sortedFrom: heapSize,
						note: 'Swap to fix heap'
					});
					i = best;
				} else {
					break;
				}
			}
		}

		for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
			steps.push({ items: snapshot(a), a: i, b: -1, sortedFrom: n, note: 'Heapify subtree' });
			heapify(n, i);
		}

		for (let end = n - 1; end > 0; end--) {
			swap(0, end);
			steps.push({
				items: snapshot(a),
				a: 0,
				b: end,
				sortedFrom: end,
				note: 'Move max to the end'
			});
			heapify(end, 0);
		}

		steps.push({ items: snapshot(a), a: -1, b: -1, sortedFrom: 0, note: 'Done.' });
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
			<div class="text-lg font-bold text-white">Heap Sort</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Build a max heap, then repeatedly move the max to the end and re-heapify.
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
								'w-14 rounded-t-lg border border-white/10 text-center text-sm font-bold text-white',
								i >= sortedFrom ? 'bg-emerald-600/45' : 'bg-white/10',
								i === activeA || i === activeB ? 'ring-2 ring-pink-300/70' : ''
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
						class="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
