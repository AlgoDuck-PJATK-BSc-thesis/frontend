<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/bfs.java';
	import Arrow from '$lib/Components/Misc/Arrow.svelte';

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

	let visited = $state<string[]>([]);
	let queue = $state<string[]>([]);
	let running = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		visited = [];
		queue = [];
		running = false;
	}

	function run() {
		if (running) return;

		const start = 'A';
		const seen = new Set<string>();
		const q: string[] = [start];
		const vis: string[] = [];
		const steps: Array<{ visited: string[]; queue: string[] }> = [];

		seen.add(start);
		steps.push({ visited: [], queue: [...q] });

		while (q.length) {
			const cur = q.shift() as string;
			vis.push(cur);

			for (const n of graph[cur].map((e) => e.node)) {
				if (!seen.has(n)) {
					seen.add(n);
					q.push(n);
				}
			}

			steps.push({ visited: [...vis], queue: [...q] });
		}

		reset();
		running = true;

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				visited = steps[i].visited;
				queue = steps[i].queue;
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
			<div class="text-lg font-bold text-white">Breadth-First Search (BFS)</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Explores level by level using a queue. Great for shortest paths in unweighted graphs.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<svg width="500" height="300" class="mx-auto">
					{#each edges as e (e.a + e.b)}
						<line
							x1={positions[e.a].x}
							y1={positions[e.a].y}
							x2={positions[e.b].x}
							y2={positions[e.b].y}
							stroke="#4b5563"
							stroke-width="2"
						/>
					{/each}

					{#each Object.keys(positions) as n (n)}
						<g>
							<circle
								cx={positions[n].x}
								cy={positions[n].y}
								r="22"
								fill={visited.includes(n) ? '#10b981' : queue.includes(n) ? '#fbbf24' : '#3b82f6'}
								stroke="#60a5fa"
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
					{#if visited.length}
						<div class="font-semibold text-white">
							<span>Order:</span>
							<span class="ml-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1">
								{#each visited as v, i (v + '-' + i)}
									<span>{v}</span>
									{#if i < visited.length - 1}
										<span class="inline-flex translate-y-[3px] opacity-90">
											<Arrow size={14} stroke="currentColor" />
										</span>
									{/if}
								{/each}
							</span>
						</div>
					{:else}
						Run BFS to see traversal order.
					{/if}
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
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
