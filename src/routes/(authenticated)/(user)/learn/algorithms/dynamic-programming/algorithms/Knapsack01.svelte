<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
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

	let running = $state(false);
	let started = $state(false);
	let done = $state(false);

	let curI = $state<number | null>(null);
	let curW = $state<number | null>(null);
	let takeVal = $state<number | null>(null);
	let skipVal = $state<number | null>(null);
	let chose = $state<'take' | 'skip' | null>(null);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		dp = [];
		best = null;

		running = false;
		started = false;
		done = false;

		curI = null;
		curW = null;
		takeVal = null;
		skipVal = null;
		chose = null;
	}

	function run() {
		if (running) return;

		const W = Math.max(1, Math.min(20, cap));
		cap = W;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		const n = items.length;
		const table: number[][] = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

		const steps: Array<{
			dp: number[][];
			curI: number | null;
			curW: number | null;
			takeVal: number | null;
			skipVal: number | null;
			chose: 'take' | 'skip' | null;
			done: boolean;
			best: number | null;
		}> = [];

		steps.push({
			dp: table.map((r) => r.slice()),
			curI: 0,
			curW: 0,
			takeVal: null,
			skipVal: null,
			chose: null,
			done: false,
			best: null
		});

		for (let i = 1; i <= n; i++) {
			for (let w = 0; w <= W; w++) {
				const it = items[i - 1];
				const skip = table[i - 1][w];
				let take: number | null = null;
				let choice: 'take' | 'skip' = 'skip';

				if (it.w <= w) {
					take = it.v + table[i - 1][w - it.w];
					if (take > skip) {
						table[i][w] = take;
						choice = 'take';
					} else {
						table[i][w] = skip;
					}
				} else {
					table[i][w] = skip;
				}

				steps.push({
					dp: table.map((r) => r.slice()),
					curI: i,
					curW: w,
					takeVal: take,
					skipVal: skip,
					chose: choice,
					done: false,
					best: null
				});
			}
		}

		steps.push({
			dp: table.map((r) => r.slice()),
			curI: n,
			curW: W,
			takeVal: null,
			skipVal: null,
			chose: null,
			done: true,
			best: table[n][W]
		});

		reset();
		started = true;
		running = true;
		done = false;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				dp = steps[idx].dp;
				curI = steps[idx].curI;
				curW = steps[idx].curW;
				takeVal = steps[idx].takeVal;
				skipVal = steps[idx].skipVal;
				chose = steps[idx].chose;
				done = steps[idx].done;
				best = steps[idx].best;
				idx += 1;
			} else {
				running = false;
				curI = null;
				curW = null;
				takeVal = null;
				skipVal = null;
				chose = null;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 350);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	function weightsHeader(W: number) {
		return Array.from({ length: W + 1 }, (_, i) => i);
	}
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-8 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-lg font-bold text-white">0/1 Knapsack</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				"0/1" means: each item is either not taken (0) or taken once (1). dp[i][w] is the best value
				using the first i items with capacity w.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex flex-wrap justify-center gap-3">
					{#each items as it}
						<div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
							<div class="font-bold text-white">Item {it.name}</div>
							<div class="text-sm text-slate-200">weight {it.w}</div>
							<div class="text-sm text-slate-200">value {it.v}</div>
						</div>
					{/each}
				</div>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if started}
						{#if done && best !== null}
							<div class="text-lg font-semibold text-white">Best value = {best}</div>
						{:else if curI !== null && curW !== null && curI > 0}
							<div class="font-semibold text-white">
								Fill dp[{curI}][{curW}] using item {items[curI - 1].name}
							</div>
							<div class="mt-1 text-slate-200">
								skip = {skipVal ?? 0}
								{#if takeVal !== null}
									, take = {takeVal}
									, choose {chose === 'take' ? 'take' : 'skip'}
								{:else}
									, item does not fit → choose skip
								{/if}
							</div>
						{:else}
							<div class="text-slate-200">Starting table…</div>
						{/if}
					{:else}
						Run to watch the DP table fill cell by cell.
					{/if}
				</div>

				{#if started && dp.length}
					<div class="mt-4 overflow-x-auto">
						<table class="mx-auto border-collapse text-sm">
							<thead>
								<tr>
									<th class="border border-white/10 px-2 py-1 text-slate-300">i\\w</th>
									{#each weightsHeader(cap) as w}
										<th class="border border-white/10 px-2 py-1 text-slate-300">{w}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each dp as row, i}
									<tr>
										<th class="border border-white/10 px-2 py-1 text-slate-300">
											{i === 0 ? '0 items' : `items 1..${i}`}
										</th>
										{#each row as cell, w}
											<td
												class={[
													'border border-white/10 px-2 py-1 text-center text-white transition',
													curI === i && curW === w ? 'bg-amber-500/40 font-semibold' : 'bg-white/5'
												].join(' ')}
											>
												{cell}
											</td>
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
								(cap = Math.max(
									1,
									Math.min(20, Number((e.target as HTMLInputElement).value) || 1)
								))}
							class="w-24 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
						/>
					</div>

					<button
						type="button"
						onclick={run}
						disabled={running}
						class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
