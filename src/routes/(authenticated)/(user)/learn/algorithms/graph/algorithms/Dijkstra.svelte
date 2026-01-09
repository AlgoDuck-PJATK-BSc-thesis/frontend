<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/dijkstra.java';

	type Edge = { node: string; weight: number };

	const graph: Record<string, Edge[]> = {
		A: [
			{ node: 'B', weight: 4 },
			{ node: 'C', weight: 2 }
		],
		B: [
			{ node: 'A', weight: 4 },
			{ node: 'D', weight: 5 },
			{ node: 'E', weight: 10 }
		],
		C: [
			{ node: 'A', weight: 2 },
			{ node: 'D', weight: 3 }
		],
		D: [
			{ node: 'B', weight: 5 },
			{ node: 'C', weight: 3 },
			{ node: 'E', weight: 1 }
		],
		E: [
			{ node: 'B', weight: 10 },
			{ node: 'D', weight: 1 }
		]
	};

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

	let visited = $state<string[]>([]);
	let dist = $state<Record<string, number>>({});
	let running = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		visited = [];
		dist = {};
		running = false;
	}

	function run() {
		if (running) return;

		const d: Record<string, number> = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity };
		const unvisited = new Set(nodes);
		const vis: string[] = [];
		const steps: Array<{ dist: Record<string, number>; visited: string[] }> = [];

		steps.push({ dist: { ...d }, visited: [] });

		while (unvisited.size) {
			let minNode: string | null = null;
			let minVal = Infinity;

			for (const n of unvisited) {
				if (d[n] < minVal) {
					minVal = d[n];
					minNode = n;
				}
			}

			if (minNode === null || minVal === Infinity) break;

			unvisited.delete(minNode);
			vis.push(minNode);

			for (const e of graph[minNode]) {
				const nd = d[minNode] + e.weight;
				if (nd < d[e.node]) d[e.node] = nd;
			}

			steps.push({ dist: { ...d }, visited: [...vis] });
		}

		reset();
		running = true;

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				dist = steps[i].dist;
				visited = steps[i].visited;
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

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Dijkstra</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Single-source shortest paths for non-negative weights.
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
							stroke="#4b5563"
							stroke-width="2"
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
							fill={visited.includes(n) ? '#10b981' : '#8b5cf6'}
							stroke="#a78bfa"
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

						{#if dist[n] !== undefined}
							<text
								x={positions[n].x}
								y={positions[n].y + 38}
								text-anchor="middle"
								fill="#fbbf24"
								font-size="13"
								font-weight="700"
							>
								{dist[n] === Infinity ? '∞' : dist[n]}
							</text>
						{/if}
					</g>
				{/each}
			</svg>

			<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
				{#if Object.keys(dist).length}
					<div class="font-semibold text-white">
						From A: {nodes.map((n) => `${n}=${dist[n] === Infinity ? '∞' : dist[n]}`).join(', ')}
					</div>
				{:else}
					Run to compute shortest distances.
				{/if}
			</div>

			<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
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
