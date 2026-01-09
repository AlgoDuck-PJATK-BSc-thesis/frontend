<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/max-heap.java';

	type PositionedNode = { x: number; y: number; value: number; key: string };
	type Edge = { fromX: number; fromY: number; toX: number; toY: number };

	let heap = $state<number[]>([100, 70, 90, 40, 30, 60, 80]);
	let input = $state('');

	let nodes = $state<PositionedNode[]>([]);
	let edges = $state<Edge[]>([]);

	function layout(values: number[]) {
		const ns: PositionedNode[] = [];
		const es: Edge[] = [];

		for (let i = 0; i < values.length; i++) {
			const level = Math.floor(Math.log2(i + 1));
			const pos = i - (2 ** level - 1);
			const total = 2 ** level;
			const spacing = 720 / (total + 1);
			const x = 100 + spacing * (pos + 1);
			const y = 60 + level * 80;

			if (i > 0) {
				const p = Math.floor((i - 1) / 2);
				const pLevel = Math.floor(Math.log2(p + 1));
				const pPos = p - (2 ** pLevel - 1);
				const pTotal = 2 ** pLevel;
				const pSpacing = 720 / (pTotal + 1);
				const px = 100 + pSpacing * (pPos + 1);
				const py = 60 + pLevel * 80;
				es.push({ fromX: px, fromY: py + 22, toX: x, toY: y - 22 });
			}

			ns.push({ x, y, value: values[i], key: `${i}-${x}-${y}-${values[i]}` });
		}

		nodes = ns;
		edges = es;
	}

	$effect(() => {
		layout(heap);
	});

	function bubbleUp(h: number[]) {
		let i = h.length - 1;
		while (i > 0) {
			const p = Math.floor((i - 1) / 2);
			if (h[i] > h[p]) {
				const t = h[i];
				h[i] = h[p];
				h[p] = t;
				i = p;
			} else break;
		}
	}

	function heapifyDown(h: number[]) {
		let i = 0;
		while (true) {
			const l = 2 * i + 1;
			const r = 2 * i + 2;
			let s = i;

			if (l < h.length && h[l] > h[s]) s = l;
			if (r < h.length && h[r] > h[s]) s = r;

			if (s !== i) {
				const t = h[i];
				h[i] = h[s];
				h[s] = t;
				i = s;
			} else break;
		}
	}

	function insert() {
		const v = parseInt(input, 10);
		if (Number.isNaN(v)) {
			input = '';
			return;
		}
		const h = [...heap, v];
		bubbleUp(h);
		heap = h;
		input = '';
	}

	function extractMax() {
		if (heap.length === 0) return;
		if (heap.length === 1) {
			heap = [];
			return;
		}
		const h = [...heap];
		h[0] = h[h.length - 1];
		h.pop();
		heapifyDown(h);
		heap = h;
	}

	function reset() {
		heap = [100, 70, 90, 40, 30, 60, 80];
		input = '';
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-xl font-black tracking-wide text-white">Max Heap</div>
		<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Largest element at the root. Insert bubbles up, extract fixes down.
		</p>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="overflow-x-auto">
				<svg
					viewBox="0 0 920 520"
					class="mx-auto h-[22rem] w-full min-w-[42rem]"
					preserveAspectRatio="xMidYMin meet"
				>
					{#each edges as e}
						<line
							x1={e.fromX}
							y1={e.fromY}
							x2={e.toX}
							y2={e.toY}
							stroke="currentColor"
							stroke-opacity="0.35"
							stroke-width="2"
						/>
					{/each}

					{#each nodes as n}
						<g>
							<circle
								cx={n.x}
								cy={n.y}
								r="22"
								fill="rgba(14,165,233,0.75)"
								stroke="rgba(255,255,255,0.15)"
								stroke-width="2"
							/>
							<text
								x={n.x}
								y={n.y + 6}
								text-anchor="middle"
								fill="white"
								font-size="14"
								font-weight="800"
							>
								{n.value}
							</text>
						</g>
					{/each}
				</svg>
			</div>

			<div class="mt-3 text-center text-xs text-[color:var(--color-landingpage-subtitle)]">
				Array: [{heap.join(', ')}]
			</div>

			<div class="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
				<div class="space-y-1">
					<label
						class="text-xs font-semibold tracking-wider text-white/70 uppercase"
						for="maxHeapValue"
					>
						Value
					</label>
					<input
						id="maxHeapValue"
						type="number"
						bind:value={input}
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
						placeholder="e.g. 120"
					/>
				</div>

				<button
					type="button"
					onclick={insert}
					class="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2 font-semibold text-white"
				>
					<Icons name="plus" />
					<span>Insert</span>
				</button>

				<button
					type="button"
					onclick={extractMax}
					class="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white"
				>
					<Icons name="minus" />
					<span>Extract</span>
				</button>

				<button
					type="button"
					onclick={reset}
					class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-2 font-semibold text-white"
				>
					<Icons name="reset" />
					<span>Reset</span>
				</button>
			</div>
		</div>
	</div>

	<CodePanel {meta} {java} />
</div>
