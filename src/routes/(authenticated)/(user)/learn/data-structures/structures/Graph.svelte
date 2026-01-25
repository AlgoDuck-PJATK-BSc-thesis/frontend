<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/graph.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import Arrow from '$lib/Components/Misc/Arrow.svelte';

	const nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

	const pos: Record<string, { x: number; y: number }> = {
		A: { x: 150, y: 80 },
		B: { x: 300, y: 80 },
		C: { x: 450, y: 80 },
		D: { x: 100, y: 220 },
		E: { x: 260, y: 220 },
		F: { x: 420, y: 220 },
		G: { x: 180, y: 340 },
		H: { x: 340, y: 340 }
	};

	const adj: Record<string, string[]> = {
		A: ['B', 'D'],
		B: ['A', 'C', 'E'],
		C: ['B', 'F'],
		D: ['A', 'E', 'G'],
		E: ['B', 'D', 'F', 'H'],
		F: ['C', 'E', 'H'],
		G: ['D', 'H'],
		H: ['E', 'F', 'G']
	};

	const edges: Array<[string, string]> = [
		['A', 'B'],
		['B', 'C'],
		['A', 'D'],
		['D', 'E'],
		['E', 'B'],
		['C', 'F'],
		['E', 'F'],
		['E', 'H'],
		['F', 'H'],
		['D', 'G'],
		['G', 'H']
	];

	let start = $state('A');
	let visited = $state<string[]>([]);
	let running = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function bfsOrder(s: string) {
		const q: string[] = [s];
		const seen = new Set<string>([s]);
		const out: string[] = [];

		while (q.length) {
			const v = q.shift() as string;
			out.push(v);
			for (const nb of adj[v] ?? []) {
				if (!seen.has(nb)) {
					seen.add(nb);
					q.push(nb);
				}
			}
		}

		return out;
	}

	function dfsOrder(s: string) {
		const out: string[] = [];
		const seen = new Set<string>();

		function go(v: string) {
			seen.add(v);
			out.push(v);
			for (const nb of adj[v] ?? []) {
				if (!seen.has(nb)) go(nb);
			}
		}

		go(s);
		return out;
	}

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		visited = [];
		running = false;
	}

	function run(order: string[]) {
		reset();
		running = true;
		let i = 0;

		intervalId = setInterval(() => {
			if (i < order.length) {
				visited = [...visited, order[i]];
				i += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 550);
	}

	function runBfs() {
		if (running) return;
		run(bfsOrder(start));
	}

	function runDfs() {
		if (running) return;
		run(dfsOrder(start));
	}

	$effect(() => {
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});
</script>

<PixelFrameSimple
	className="w-full px-10 pr-10 py-10 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-xl font-black tracking-wide text-white">Graph</div>
			<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Run Breadth-First Search (BFS) or Depth-First Search (DFS) and watch which nodes get
				visited, in order.
			</p>

			<div class="mt-6 space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex items-end justify-between gap-3">
					<div class="space-y-1">
						<label
							class="text-xs font-semibold tracking-wider text-white/70 uppercase"
							for="graphStart"
						>
							Start node
						</label>
						<select
							id="graphStart"
							bind:value={start}
							disabled={running}
							class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white disabled:bg-gray-700"
						>
							{#each nodes as n (n)}
								<option value={n}>{n}</option>
							{/each}
						</select>
					</div>

					<div class="flex flex-wrap items-center justify-end gap-2">
						<button
							type="button"
							onclick={runBfs}
							disabled={running}
							class="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
						>
							<Icons name="play" />
							<span>BFS</span>
						</button>

						<button
							type="button"
							onclick={runDfs}
							disabled={running}
							class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
						>
							<Icons name="play" />
							<span>DFS</span>
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

				<div class="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-4">
					<svg width="620" height="420" viewBox="0 0 620 420" class="mx-auto">
						{#each edges as [a, b] (a + '-' + b)}
							<line
								x1={pos[a].x}
								y1={pos[a].y}
								x2={pos[b].x}
								y2={pos[b].y}
								stroke="currentColor"
								stroke-opacity="0.35"
								stroke-width="2"
							/>
						{/each}

						{#each nodes as n (n)}
							<g>
								<circle
									cx={pos[n].x}
									cy={pos[n].y}
									r="28"
									fill={visited.includes(n) ? 'rgba(34,211,238,0.85)' : 'rgba(8,145,178,0.55)'}
									stroke="rgba(255,255,255,0.15)"
									stroke-width="2"
								/>
								<text
									x={pos[n].x}
									y={pos[n].y + 7}
									text-anchor="middle"
									fill="white"
									font-size="18"
									font-weight="900"
								>
									{n}
								</text>
							</g>
						{/each}
					</svg>
				</div>

				<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
					<div class="text-xs font-semibold tracking-wider text-white/70 uppercase">
						Visited order
					</div>

					{#if visited.length}
						<div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-200">
							{#each visited as v, i (v + '-' + i)}
								<span>{v}</span>
								{#if i < visited.length - 1}
									<span class="inline-flex translate-y-[-1px] opacity-90">
										<Arrow size={16} stroke="currentColor" />
									</span>
								{/if}
							{/each}
						</div>
					{:else}
						<div class="mt-2 text-sm text-slate-200">Run BFS/DFS to see the visit order.</div>
					{/if}
				</div>

				<div class="rounded-2xl border border-white/10 bg-white/5 p-4">
					<div class="text-xs font-semibold tracking-wider text-white/70 uppercase">
						Adjacency list
					</div>
					<div class="mt-2 space-y-1 text-sm text-slate-200">
						{#each Object.entries(adj) as [k, v] (k)}
							<div class="flex items-center gap-2">
								<span>{k}</span>
								<span class="inline-flex translate-y-[-1px] opacity-90">
									<Arrow size={14} stroke="currentColor" />
								</span>
								<span>[{v.join(', ')}]</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<CodePanel {meta} {java} />
	</div>
</PixelFrameSimple>
