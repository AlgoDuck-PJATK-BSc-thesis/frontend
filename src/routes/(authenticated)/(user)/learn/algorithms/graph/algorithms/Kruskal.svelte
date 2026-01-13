<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/kruskal.java';

	const positions: Record<string, { x: number; y: number }> = {
		A: { x: 150, y: 100 },
		B: { x: 300, y: 50 },
		C: { x: 100, y: 220 },
		D: { x: 260, y: 220 },
		E: { x: 360, y: 150 }
	};

	const edges = [
		{ a: 'A', b: 'B', w: 4 },
		{ a: 'A', b: 'C', w: 2 },
		{ a: 'B', b: 'D', w: 5 },
		{ a: 'B', b: 'E', w: 10 },
		{ a: 'C', b: 'D', w: 3 },
		{ a: 'D', b: 'E', w: 1 }
	];

	const nodes = ['A', 'B', 'C', 'D', 'E'];

	type MEdge = { a: string; b: string; w: number };

	let mst = $state<MEdge[]>([]);
	let running = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function key(a: string, b: string) {
		return a < b ? `${a}-${b}` : `${b}-${a}`;
	}

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		mst = [];
		running = false;
	}

	function run() {
		if (running) return;

		const sorted = edges.slice().sort((x, y) => x.w - y.w);

		const parent: Record<string, string> = {};
		for (const n of nodes) parent[n] = n;

		const find = (v: string): string => {
			let cur = v;
			while (parent[cur] !== cur) cur = parent[cur];
			return cur;
		};

		const union = (x: string, y: string) => {
			const rx = find(x);
			const ry = find(y);
			parent[rx] = ry;
		};

		const steps: MEdge[][] = [];
		const current: MEdge[] = [];

		for (const e of sorted) {
			if (find(e.a) !== find(e.b)) {
				current.push(e);
				union(e.a, e.b);
				steps.push(current.slice());
			}
		}

		reset();
		running = true;

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				mst = steps[i];
				i += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 850);
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
			<div class="text-lg font-bold text-white">Kruskal</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Builds a Minimum Spanning Tree (MST): a set of V-1 edges that connects all nodes with the
				smallest possible total weight. It sorts edges by weight and adds an edge only if it does
				not create a cycle.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<svg width="500" height="300" class="mx-auto">
					{#each edges as e (e.a + e.b)}
						<g>
							<line
								x1={positions[e.a].x}
								y1={positions[e.a].y}
								x2={positions[e.b].x}
								y2={positions[e.b].y}
								stroke={mst.some((m) => key(m.a, m.b) === key(e.a, e.b)) ? '#10b981' : '#4b5563'}
								stroke-width={mst.some((m) => key(m.a, m.b) === key(e.a, e.b)) ? 4 : 2}
							/>
							<text
								x={(positions[e.a].x + positions[e.b].x) / 2}
								y={(positions[e.a].y + positions[e.b].y) / 2 - 6}
								fill="#fbbf24"
								font-size="12"
								font-weight="700"
								text-anchor="middle"
							>
								{e.w}
							</text>
						</g>
					{/each}

					{#each nodes as n (n)}
						<g>
							<circle
								cx={positions[n].x}
								cy={positions[n].y}
								r="22"
								fill="#f97316"
								stroke="#fb923c"
								stroke-width="2"
							/>
							<text
								x={positions[n].x}
								y={positions[n].y + 6}
								text-anchor="middle"
								fill="white"
								font-size="16"
								font-weight="700"
							>
								{n}
							</text>
						</g>
					{/each}
				</svg>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if mst.length}
						<div class="font-semibold text-white">
							Minimum Spanning Tree (MST): {mst.map((e) => `${e.a}-${e.b}(${e.w})`).join(', ')}
						</div>
					{:else}
						Run to build the Minimum Spanning Tree (MST).
					{/if}
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
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
