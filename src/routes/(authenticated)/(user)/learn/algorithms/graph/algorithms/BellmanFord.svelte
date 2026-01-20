<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/bellman-ford.java';

	const nodes = ['A', 'B', 'C', 'D', 'E'];

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
		{ a: 'C', b: 'D', w: 3 },
		{ a: 'B', b: 'D', w: 5 },
		{ a: 'D', b: 'E', w: 1 },
		{ a: 'B', b: 'E', w: 10 }
	];

	let dist = $state<Record<string, number> | null>(null);
	let pass = $state(0);
	let edgeIndex = $state<number | null>(null);
	let updated = $state(false);
	let running = $state(false);
	let done = $state(false);
	let negativeCycle = $state<boolean | null>(null);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function fmt(v: number) {
		return v === Infinity ? 'INF' : String(v);
	}

	function distValue(n: string) {
		return dist ? dist[n] : Infinity;
	}

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		dist = null;
		pass = 0;
		edgeIndex = null;
		updated = false;
		running = false;
		done = false;
		negativeCycle = null;
	}

	function run() {
		if (running) return;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		const d: Record<string, number> = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity };

		const steps: Array<{
			pass: number;
			edgeIndex: number | null;
			dist: Record<string, number>;
			updated: boolean;
			done: boolean;
			negativeCycle: boolean | null;
		}> = [];

		steps.push({
			pass: 0,
			edgeIndex: null,
			dist: { ...d },
			updated: false,
			done: false,
			negativeCycle: null
		});

		for (let p = 1; p <= nodes.length - 1; p++) {
			for (let i = 0; i < edges.length; i++) {
				const e = edges[i];
				let didUpdate = false;

				if (d[e.a] !== Infinity) {
					const nd = d[e.a] + e.w;
					if (nd < d[e.b]) {
						d[e.b] = nd;
						didUpdate = true;
					}
				}

				if (d[e.b] !== Infinity) {
					const nd = d[e.b] + e.w;
					if (nd < d[e.a]) {
						d[e.a] = nd;
						didUpdate = true;
					}
				}

				steps.push({
					pass: p,
					edgeIndex: i,
					dist: { ...d },
					updated: didUpdate,
					done: false,
					negativeCycle: null
				});
			}
		}

		let neg = false;
		for (const e of edges) {
			if (d[e.a] !== Infinity && d[e.a] + e.w < d[e.b]) {
				neg = true;
				break;
			}
			if (d[e.b] !== Infinity && d[e.b] + e.w < d[e.a]) {
				neg = true;
				break;
			}
		}

		steps.push({
			pass: nodes.length - 1,
			edgeIndex: null,
			dist: { ...d },
			updated: false,
			done: true,
			negativeCycle: neg
		});

		running = true;
		done = false;

		pass = steps[0].pass;
		dist = steps[0].dist;
		edgeIndex = steps[0].edgeIndex;
		updated = steps[0].updated;
		negativeCycle = steps[0].negativeCycle;

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				pass = steps[i].pass;
				dist = steps[i].dist;
				edgeIndex = steps[i].edgeIndex;
				updated = steps[i].updated;
				done = steps[i].done;
				negativeCycle = steps[i].negativeCycle;
				i += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 650);
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
			<div class="text-lg font-bold text-[color:var(--color-landingpage-subtitle)]">
				Bellman-Ford
			</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Computes shortest distances from A by repeatedly checking every edge to see if it can
				improve a distance. INF means the node has not been reached yet.
			</div>

			<div class="mt-3 text-xs text-[color:var(--color-landingpage-subtitle)]">
				Yellow edge: checked now. Green edge: distance improved on this check. Numbers under nodes:
				current best distance from A.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<svg width="500" height="300" class="mx-auto">
					{#each edges as e, i (e.a + e.b)}
						<g>
							<line
								x1={positions[e.a].x}
								y1={positions[e.a].y}
								x2={positions[e.b].x}
								y2={positions[e.b].y}
								stroke={edgeIndex === i ? (updated ? '#10b981' : '#fbbf24') : '#4b5563'}
								stroke-width={edgeIndex === i ? 4 : 2}
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
								fill="#ef4444"
								stroke="#fecaca"
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

							<text
								x={positions[n].x}
								y={positions[n].y + 38}
								text-anchor="middle"
								fill="#fbbf24"
								font-size="13"
								font-weight="700"
							>
								{fmt(distValue(n))}
							</text>
						</g>
					{/each}
				</svg>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if dist}
						<div class="font-semibold text-white">
							{#if done}
								Result (from A): {nodes.map((n) => `${n}=${fmt(distValue(n))}`).join(', ')}
							{:else}
								Pass {pass} of {nodes.length - 1}
							{/if}
						</div>

						{#if done && negativeCycle !== null}
							<div class="mt-1 text-slate-200">
								{negativeCycle
									? 'Negative cycle detected (distances can keep decreasing).'
									: 'No negative cycle detected.'}
							</div>
						{/if}

						{#if edgeIndex !== null}
							{@const e = edges[edgeIndex]}
							<div class="mt-1 text-slate-200">
								Checking edge {e.a}-{e.b} (w={e.w}) {updated ? '→ improved a distance' : ''}
							</div>
						{/if}
					{:else}
						Run to see edge-by-edge updates.
					{/if}
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
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
