<script lang="ts">
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/knapsack.java';

	const items = [
		{ name: 'A', w: 2, v: 6 },
		{ name: 'B', w: 2, v: 10 },
		{ name: 'C', w: 3, v: 12 }
	] as const;

	let cap = $state(10);
	let dp = $state<number[][]>([]);
	let best = $state<number | null>(null);
	let computed = $state(false);

	function reset() {
		dp = [];
		best = null;
		computed = false;
	}

	function run() {
		const W = Math.max(1, Math.min(20, cap));
		cap = W;

		const n = items.length;
		const table: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

		for (let i = 1; i <= n; i++) {
			for (let w = 1; w <= W; w++) {
				const it = items[i - 1];
				if (it.w <= w) {
					table[i][w] = Math.max(it.v + table[i - 1][w - it.w], table[i - 1][w]);
				} else table[i][w] = table[i - 1][w];
			}
		}

		dp = table;
		best = table[n][W];
		computed = true;
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">0/1 Knapsack</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Each item can be taken at most once. DP decides include vs exclude.
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="flex flex-wrap justify-center gap-3">
				{#each items as it}
					<div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
						<div class="font-bold text-white">{it.name}</div>
						<div class="text-sm text-slate-200">w={it.w}</div>
						<div class="text-sm text-slate-200">v={it.v}</div>
					</div>
				{/each}
			</div>

			<div class="mt-4 space-y-2 text-center">
				{#if computed && best !== null}
					<div class="text-lg font-semibold text-white">Best value = {best}</div>
				{:else}
					<div class="text-sm text-[color:var(--color-landingpage-subtitle)]">
						Run to compute best value for capacity.
					</div>
				{/if}
			</div>

			{#if computed}
				<div class="mt-4 overflow-x-auto">
					<table class="mx-auto border-collapse">
						<thead>
							<tr>
								<th class="border border-white/10 px-2 py-1 text-slate-300">i\\w</th>
								{#each Array.from({ length: cap + 1 }, (_, i) => i) as w}
									<th class="border border-white/10 px-2 py-1 text-slate-300">{w}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each dp as row, i}
								<tr>
									<th class="border border-white/10 px-2 py-1 text-slate-300">{i}</th>
									{#each row as cell}
										<td class="border border-white/10 px-2 py-1 text-center text-white">{cell}</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
				<div class="flex items-center gap-2">
					<label class="text-sm text-white" for="ks-cap">Capacity</label>
					<input
						id="ks-cap"
						type="number"
						min="1"
						max="20"
						value={cap}
						oninput={(e) =>
							(cap = Math.max(1, Math.min(20, Number((e.target as HTMLInputElement).value) || 1)))}
						class="w-24 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
					/>
				</div>

				<button
					type="button"
					onclick={run}
					class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white"
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
