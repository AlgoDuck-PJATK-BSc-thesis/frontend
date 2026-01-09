<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/fibonacci.java';

	let n = $state(7);
	let table = $state<number[]>([]);
	let currentI = $state<number | null>(null);
	let result = $state<number | null>(null);
	let running = $state(false);
	let started = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		table = [];
		currentI = null;
		result = null;
		running = false;
		started = false;
	}

	function run() {
		if (running) return;

		const nn = Math.max(0, Math.min(20, n));
		n = nn;

		const steps: Array<{ table: number[]; currentI: number | null; result: number | null }> = [];

		if (nn === 0) {
			steps.push({ table: [0], currentI: 0, result: 0 });
		} else if (nn === 1) {
			steps.push({ table: [0, 1], currentI: 1, result: 1 });
		} else {
			const dp: number[] = Array(nn + 1).fill(0);
			dp[0] = 0;
			dp[1] = 1;
			steps.push({ table: dp.slice(0, 2), currentI: 1, result: null });

			for (let i = 2; i <= nn; i++) {
				dp[i] = dp[i - 1] + dp[i - 2];
				steps.push({ table: dp.slice(0, i + 1), currentI: i, result: i === nn ? dp[i] : null });
			}
		}

		reset();
		running = true;
		started = true;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				table = steps[idx].table;
				currentI = steps[idx].currentI;
				result = steps[idx].result;
				idx += 1;
			} else {
				running = false;
				currentI = null;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 650);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Fibonacci (Tabulation)</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Build answers bottom-up: F(i) = F(i-1) + F(i-2).
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="flex flex-wrap justify-center gap-2">
				{#if started}
					{#each table as v, i}
						<div class="flex flex-col items-center gap-1">
							<div class="text-[11px] text-slate-300">F({i})</div>
							<div
								class={[
									'flex h-16 w-16 items-center justify-center rounded-xl border-2 font-extrabold',
									i === currentI
										? 'border-amber-300 bg-amber-500/40 text-white'
										: 'border-emerald-300 bg-emerald-600/30 text-white'
								].join(' ')}
							>
								{v}
							</div>
						</div>
					{/each}
				{:else}
					<div class="text-sm text-[color:var(--color-landingpage-subtitle)]">
						Run to see the DP table fill.
					</div>
				{/if}
			</div>

			<div class="mt-4 space-y-2 text-center">
				{#if result !== null}
					<div class="text-lg font-semibold text-white">F({n}) = {result}</div>
				{:else if started}
					<div class="text-sm text-[color:var(--color-landingpage-subtitle)]">Filling table…</div>
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
