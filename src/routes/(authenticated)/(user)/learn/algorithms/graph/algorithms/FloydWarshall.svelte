<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/floyd-warshall.java';

	const nodes = ['A', 'B', 'C', 'D', 'E'];
	const INF = 1_000_000;

	function fmt(v: number) {
		return v >= INF ? 'INF' : String(v);
	}

	function clone(d: Record<string, Record<string, number>>) {
		const out: Record<string, Record<string, number>> = {};
		for (const r of nodes) {
			out[r] = {};
			for (const c of nodes) out[r][c] = d[r][c];
		}
		return out;
	}

	const base: Record<string, Record<string, number>> = {
		A: { A: 0, B: 4, C: 2, D: INF, E: INF },
		B: { A: 4, B: 0, C: INF, D: 5, E: 10 },
		C: { A: 2, B: INF, C: 0, D: 3, E: INF },
		D: { A: INF, B: 5, C: 3, D: 0, E: 1 },
		E: { A: INF, B: 10, C: INF, D: 1, E: 0 }
	};

	let dist = $state<Record<string, Record<string, number>>>(clone(base));
	let kIndex = $state<number>(-1);
	let running = $state(false);
	let done = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		dist = clone(base);
		kIndex = -1;
		running = false;
		done = false;
	}

	function run() {
		if (running) return;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		const d = clone(base);

		const steps: Array<{ k: number; dist: Record<string, Record<string, number>>; done: boolean }> =
			[];
		steps.push({ k: -1, dist: clone(d), done: false });

		for (let ki = 0; ki < nodes.length; ki++) {
			const k = nodes[ki];

			for (const i of nodes) {
				for (const j of nodes) {
					const nd = d[i][k] + d[k][j];
					if (nd < d[i][j]) d[i][j] = nd;
				}
			}

			steps.push({ k: ki, dist: clone(d), done: false });
		}

		steps.push({ k: nodes.length - 1, dist: clone(d), done: true });

		running = true;
		done = false;

		kIndex = steps[0].k;
		dist = steps[0].dist;
		done = steps[0].done;

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				kIndex = steps[i].k;
				dist = steps[i].dist;
				done = steps[i].done;
				i += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 900);
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
			<div class="text-lg font-bold text-white">Floyd-Warshall</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Computes shortest distances between every pair of nodes. It starts with direct edges, then
				for each node K it tries to improve every route i→j by allowing it to go through K.
			</div>

			<div class="mt-3 text-xs text-[color:var(--color-landingpage-subtitle)]">
				Highlighted row/column: the current intermediate node K. INF means “no path known /
				unreachable”.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if kIndex === -1 && !done}
						<div class="font-semibold text-white">Initial distances (direct edges)</div>
					{:else if done}
						<div class="font-semibold text-white">Result: all-pairs shortest distances</div>
					{:else}
						<div class="font-semibold text-white">
							Step: allow {nodes[kIndex]} as an intermediate node
						</div>
					{/if}
				</div>

				<div class="mt-4 overflow-x-auto">
					<table class="mx-auto border-collapse text-sm">
						<thead>
							<tr>
								<th class="border border-white/10 px-3 py-2 text-white"></th>
								{#each nodes as c}
									<th
										class={[
											'border border-white/10 px-3 py-2 text-white',
											kIndex !== -1 && c === nodes[kIndex] ? 'bg-yellow-500/20' : ''
										].join(' ')}
									>
										{c}
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each nodes as r}
								<tr>
									<th
										class={[
											'border border-white/10 px-3 py-2 text-white',
											kIndex !== -1 && r === nodes[kIndex] ? 'bg-yellow-500/20' : ''
										].join(' ')}
									>
										{r}
									</th>
									{#each nodes as c}
										<td class="border border-white/10 px-3 py-2 text-center text-slate-200">
											{fmt(dist[r][c])}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
					<button
						type="button"
						onclick={run}
						disabled={running}
						class="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
