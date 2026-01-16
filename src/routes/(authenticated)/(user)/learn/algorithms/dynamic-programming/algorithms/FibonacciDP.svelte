<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/fibonacci.java';

	let n = $state(7);

	let table = $state<number[]>([]);
	let iCur = $state<number | null>(null);
	let aIdx = $state<number | null>(null);
	let bIdx = $state<number | null>(null);
	let result = $state<number | null>(null);

	let running = $state(false);
	let started = $state(false);
	let done = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		table = [];
		iCur = null;
		aIdx = null;
		bIdx = null;
		result = null;
		running = false;
		started = false;
		done = false;
	}

	function run() {
		if (running) return;

		const nn = Math.max(0, Math.min(20, n));
		n = nn;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		const steps: Array<{
			table: number[];
			iCur: number | null;
			aIdx: number | null;
			bIdx: number | null;
			result: number | null;
			done: boolean;
		}> = [];

		if (nn === 0) {
			steps.push({ table: [0], iCur: 0, aIdx: null, bIdx: null, result: 0, done: true });
		} else if (nn === 1) {
			steps.push({ table: [0, 1], iCur: 1, aIdx: null, bIdx: null, result: 1, done: true });
		} else {
			const dp: number[] = Array(nn + 1).fill(0);
			dp[0] = 0;
			dp[1] = 1;

			steps.push({
				table: dp.slice(0, 2),
				iCur: 1,
				aIdx: null,
				bIdx: null,
				result: null,
				done: false
			});

			for (let i = 2; i <= nn; i++) {
				dp[i] = dp[i - 1] + dp[i - 2];
				steps.push({
					table: dp.slice(0, i + 1),
					iCur: i,
					aIdx: i - 1,
					bIdx: i - 2,
					result: i === nn ? dp[i] : null,
					done: i === nn
				});
			}
		}

		reset();
		started = true;
		running = true;
		done = false;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				table = steps[idx].table;
				iCur = steps[idx].iCur;
				aIdx = steps[idx].aIdx;
				bIdx = steps[idx].bIdx;
				result = steps[idx].result;
				done = steps[idx].done;
				idx += 1;
			} else {
				running = false;
				iCur = null;
				aIdx = null;
				bIdx = null;
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
			<div class="text-lg font-bold text-white">Fibonacci (Tabulation)</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				We fill a table from left to right. Each new cell uses the two previous cells: F(i) = F(i-1)
				+ F(i-2).
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex flex-wrap justify-center gap-2">
					{#if started}
						{#each table as v, i}
							<div class="flex flex-col items-center gap-1">
								<div class="text-[11px] text-slate-300">F({i})</div>
								<div
									class={[
										'flex h-16 w-16 items-center justify-center rounded-xl border-2 font-extrabold transition',
										i === iCur ? 'border-amber-300 bg-amber-500/40 text-white' : '',
										i === aIdx ? 'border-sky-300 bg-sky-500/30 text-white' : '',
										i === bIdx ? 'border-sky-300 bg-sky-500/30 text-white' : '',
										i !== iCur && i !== aIdx && i !== bIdx
											? 'border-emerald-300 bg-emerald-600/30 text-white'
											: ''
									].join(' ')}
								>
									{v}
								</div>
							</div>
						{/each}
					{:else}
						<div class="text-sm text-[color:var(--color-landingpage-subtitle)]">
							Run to see the table fill step by step.
						</div>
					{/if}
				</div>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if started && !done && iCur !== null && aIdx !== null && bIdx !== null}
						<div class="font-semibold text-white">
							Compute F({iCur}) = F({aIdx}) + F({bIdx}) = {table[aIdx]} + {table[bIdx]} = {table[
								iCur
							]}
						</div>
					{:else if result !== null}
						<div class="text-lg font-semibold text-white">Result: F({n}) = {result}</div>
					{/if}
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
					<div class="flex items-center gap-2">
						<label class="text-sm text-white" for="fib-n">n</label>
						<input
							id="fib-n"
							type="number"
							min="0"
							max="20"
							value={n}
							oninput={(e) =>
								(n = Math.max(0, Math.min(20, Number((e.target as HTMLInputElement).value) || 0)))}
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
