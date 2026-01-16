<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
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
	let currentNode = $state<string | null>(null);
	let currentEdge = $state<{ a: string; b: string } | null>(null);
	let currentEdgeUpdated = $state(false);
	let running = $state(false);
	let done = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function fmt(v: number) {
		return v === Infinity ? 'INF' : String(v);
	}

	function edgeKey(a: string, b: string) {
		return a < b ? `${a}-${b}` : `${b}-${a}`;
	}

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		visited = [];
		dist = {};
		currentNode = null;
		currentEdge = null;
		currentEdgeUpdated = false;
		running = false;
		done = false;
	}

	function run() {
		if (running) return;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		const d: Record<string, number> = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity };
		const unvisited = new Set(nodes);
		const vis: string[] = [];

		const steps: Array<{
			dist: Record<string, number>;
			visited: string[];
			currentNode: string | null;
			currentEdge: { a: string; b: string } | null;
			updated: boolean;
			done: boolean;
		}> = [];

		steps.push({
			dist: { ...d },
			visited: [],
			currentNode: null,
			currentEdge: null,
			updated: false,
			done: false
		});

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

			steps.push({
				dist: { ...d },
				visited: [...vis],
				currentNode: minNode,
				currentEdge: null,
				updated: false,
				done: false
			});

			for (const e of graph[minNode]) {
				const nd = d[minNode] + e.weight;
				const updated = nd < d[e.node];
				if (updated) d[e.node] = nd;

				steps.push({
					dist: { ...d },
					visited: [...vis],
					currentNode: minNode,
					currentEdge: { a: minNode, b: e.node },
					updated,
					done: false
				});
			}
		}

		steps.push({
			dist: { ...d },
			visited: [...vis],
			currentNode: null,
			currentEdge: null,
			updated: false,
			done: true
		});

		running = true;
		done = false;

		dist = steps[0].dist;
		visited = steps[0].visited;
		currentNode = steps[0].currentNode;
		currentEdge = steps[0].currentEdge;
		currentEdgeUpdated = steps[0].updated;

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				dist = steps[i].dist;
				visited = steps[i].visited;
				currentNode = steps[i].currentNode;
				currentEdge = steps[i].currentEdge;
				currentEdgeUpdated = steps[i].updated;
				done = steps[i].done;
				i += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 700);
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
			<div class="text-lg font-bold text-white">Dijkstra</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Finds shortest distances from A when all edge weights are non-negative. Each step picks the
				closest unvisited node, marks it visited, then tries to improve its neighbors.
			</div>

			<div class="mt-3 text-xs text-[color:var(--color-landingpage-subtitle)]">
				Yellow node: currently expanding. Green nodes: finalized. Yellow edge: checked now. Green
				edge: distance improved. INF means not reached yet.
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
								stroke={currentEdge && edgeKey(currentEdge.a, currentEdge.b) === edgeKey(e.a, e.b)
									? currentEdgeUpdated
										? '#10b981'
										: '#fbbf24'
									: '#4b5563'}
								stroke-width={currentEdge &&
								edgeKey(currentEdge.a, currentEdge.b) === edgeKey(e.a, e.b)
									? 4
									: 2}
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
								fill={currentNode === n ? '#fbbf24' : visited.includes(n) ? '#10b981' : '#8b5cf6'}
								stroke={currentNode === n ? '#fde68a' : '#a78bfa'}
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
									{fmt(dist[n])}
								</text>
							{/if}
						</g>
					{/each}
				</svg>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if Object.keys(dist).length}
						<div class="font-semibold text-white">
							{done
								? `Result (from A): ${nodes.map((n) => `${n}=${fmt(dist[n])}`).join(', ')}`
								: `Current best distances: ${nodes.map((n) => `${n}=${fmt(dist[n])}`).join(', ')}`}
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
</PixelFrameSimple>
