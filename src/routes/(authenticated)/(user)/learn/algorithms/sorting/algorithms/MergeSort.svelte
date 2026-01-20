<script lang="ts">
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/merge.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	type Item = { id: number; value: number };
	type Step = { items: Item[]; focus: number; lo: number; hi: number; note: string };

	const initialValues = [38, 27, 43, 3, 9, 82, 10];
	const n0 = initialValues.length;

	function makeItems(values: number[]): Item[] {
		return values.map((v, i) => ({ id: i, value: v }));
	}

	function snapshot(a: Item[]) {
		return a.slice();
	}

	let items = $state<Item[]>(makeItems(initialValues));
	let running = $state(false);

	let focus = $state(-1);
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
		focus = -1;
		rangeLo = 0;
		rangeHi = n0 - 1;
		status = 'Ready.';
	}

	function buildSteps(start: Item[]): Step[] {
		const a = start.slice();
		const steps: Step[] = [];

		function merge(lo: number, mid: number, hi: number) {
			const left = a.slice(lo, mid + 1);
			const right = a.slice(mid + 1, hi + 1);

			let i = 0;
			let j = 0;
			let k = lo;

			while (i < left.length && j < right.length) {
				const pickLeft = left[i].value <= right[j].value;
				a[k] = pickLeft ? left[i] : right[j];
				steps.push({
					items: snapshot(a),
					focus: k,
					lo,
					hi,
					note: pickLeft ? `Write ${left[i].value}` : `Write ${right[j].value}`
				});
				if (pickLeft) i += 1;
				else j += 1;
				k += 1;
			}

			while (i < left.length) {
				a[k] = left[i];
				steps.push({ items: snapshot(a), focus: k, lo, hi, note: `Write ${left[i].value}` });
				i += 1;
				k += 1;
			}

			while (j < right.length) {
				a[k] = right[j];
				steps.push({ items: snapshot(a), focus: k, lo, hi, note: `Write ${right[j].value}` });
				j += 1;
				k += 1;
			}
		}

		function sort(lo: number, hi: number) {
			if (lo >= hi) return;
			const mid = Math.floor((lo + hi) / 2);
			sort(lo, mid);
			sort(mid + 1, hi);
			steps.push({ items: snapshot(a), focus: -1, lo, hi, note: 'Merge halves' });
			merge(lo, mid, hi);
		}

		sort(0, a.length - 1);

		steps.push({ items: snapshot(a), focus: -1, lo: 0, hi: a.length - 1, note: 'Done.' });
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
				focus = s.focus;
				rangeLo = s.lo;
				rangeHi = s.hi;
				status = s.note;
				idx += 1;
			} else {
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
				running = false;
				focus = -1;
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
			<div class="text-lg font-bold text-white">Merge Sort</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Divide-and-conquer: split, sort halves, then merge.
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
								i >= rangeLo && i <= rangeHi ? 'bg-white/10' : 'bg-white/5',
								i === focus ? 'ring-2 ring-orange-300/70' : ''
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
						class="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
