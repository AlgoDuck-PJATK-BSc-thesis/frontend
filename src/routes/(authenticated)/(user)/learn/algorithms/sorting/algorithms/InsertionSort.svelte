<script lang="ts">
	import { onDestroy } from 'svelte';
	import { flip } from 'svelte/animate';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/insertion.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	type Item = { id: number; value: number };
	type Step = {
		items: Item[];
		keyIndex: number;
		scanIndex: number;
		sortedTo: number;
		note: string;
	};

	const initialValues = [12, 11, 13, 5, 6];

	function makeItems(values: number[]): Item[] {
		return values.map((v, i) => ({ id: i, value: v }));
	}

	function snapshot(a: Item[]) {
		return a.slice();
	}

	let items = $state<Item[]>(makeItems(initialValues));
	let running = $state(false);

	let keyIndex = $state(-1);
	let scanIndex = $state(-1);
	let sortedTo = $state(0);
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
		keyIndex = -1;
		scanIndex = -1;
		sortedTo = 0;
		status = 'Ready.';
	}

	function buildSteps(start: Item[]): Step[] {
		const a = start.slice();
		const steps: Step[] = [];

		for (let i = 1; i < a.length; i++) {
			const key = a[i];
			let j = i - 1;

			steps.push({
				items: snapshot(a),
				keyIndex: i,
				scanIndex: j,
				sortedTo: i - 1,
				note: `Pick key ${key.value}`
			});

			while (j >= 0 && a[j].value > key.value) {
				a[j + 1] = a[j];
				steps.push({
					items: snapshot(a),
					keyIndex: j + 1,
					scanIndex: j,
					sortedTo: i - 1,
					note: `Shift ${a[j].value} right`
				});
				j -= 1;
			}

			a[j + 1] = key;
			steps.push({
				items: snapshot(a),
				keyIndex: j + 1,
				scanIndex: j,
				sortedTo: i,
				note: `Insert key`
			});
		}

		steps.push({
			items: snapshot(a),
			keyIndex: -1,
			scanIndex: -1,
			sortedTo: a.length - 1,
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
				keyIndex = s.keyIndex;
				scanIndex = s.scanIndex;
				sortedTo = s.sortedTo;
				status = s.note;
				idx += 1;
			} else {
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
				running = false;
				keyIndex = -1;
				scanIndex = -1;
				sortedTo = items.length - 1;
				status = 'Done.';
			}
		}, 520);
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
			<div class="text-lg font-bold text-white">Insertion Sort</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Grows a sorted prefix by inserting each next element into its correct position.
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
								i <= sortedTo ? 'bg-emerald-600/45' : 'bg-white/10',
								i === keyIndex ? 'ring-2 ring-purple-300/70' : '',
								i === scanIndex ? 'ring-2 ring-cyan-300/70' : ''
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
						class="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
