<script lang="ts">
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/floyd-warshall.java';

	const nodes = ['A', 'B', 'C', 'D', 'E'];
	const INF = 1_000_000;

	const base: Record<string, Record<string, number>> = {
		A: { A: 0, B: 4, C: 2, D: INF, E: INF },
		B: { A: 4, B: 0, C: INF, D: 5, E: 10 },
		C: { A: 2, B: INF, C: 0, D: 3, E: INF },
		D: { A: INF, B: 5, C: 3, D: 0, E: 1 },
		E: { A: INF, B: 10, C: INF, D: 1, E: 0 }
	};

	let dist = $state<Record<string, Record<string, number>> | null>(null);

	function compute() {
		const d: Record<string, Record<string, number>> = {};
		for (const i of nodes) {
			d[i] = {};
			for (const j of nodes) d[i][j] = base[i][j];
		}

		for (const k of nodes) {
			for (const i of nodes) {
				for (const j of nodes) {
					const nd = d[i][k] + d[k][j];
					if (nd < d[i][j]) d[i][j] = nd;
				}
			}
		}

		dist = d;
	}

	function reset() {
		dist = null;
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Floyd–Warshall</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			All-pairs shortest paths. Best when you need distances between every pair.
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			{#if dist}
				<div class="overflow-x-auto">
					<table class="mx-auto border-collapse text-sm">
						<thead>
							<tr>
								<th class="border border-white/10 px-3 py-2 text-white"></th>
								{#each nodes as c}
									<th class="border border-white/10 px-3 py-2 text-white">{c}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each nodes as r}
								<tr>
									<th class="border border-white/10 px-3 py-2 text-white">{r}</th>
									{#each nodes as c}
										<td class="border border-white/10 px-3 py-2 text-center text-slate-200">
											{dist[r][c] >= INF ? '∞' : dist[r][c]}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<div class="text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					Compute to see the shortest distances between all pairs.
				</div>
			{/if}

			<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					onclick={compute}
					class="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2 font-semibold text-white"
				>
					<Icons name="play" />
					<span>Compute</span>
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
