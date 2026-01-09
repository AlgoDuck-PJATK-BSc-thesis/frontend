<script lang="ts">
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/coin-change.java';

	const coins = [1, 2, 5] as const;

	let amount = $state(11);
	let dp = $state<number[]>([]);
	let answer = $state<number | null>(null);
	let computed = $state(false);

	function reset() {
		dp = [];
		answer = null;
		computed = false;
	}

	function run() {
		const A = Math.max(0, Math.min(60, amount));
		amount = A;

		const arr: number[] = Array(A + 1).fill(Number.POSITIVE_INFINITY);
		arr[0] = 0;

		for (let i = 1; i <= A; i++) {
			for (const c of coins) {
				if (c <= i && arr[i - c] !== Number.POSITIVE_INFINITY) {
					arr[i] = Math.min(arr[i], arr[i - c] + 1);
				}
			}
		}

		dp = arr;
		answer = arr[A] === Number.POSITIVE_INFINITY ? -1 : arr[A];
		computed = true;
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Coin Change (Min Coins)</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			dp[x] = minimum coins to make amount x.
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="flex flex-wrap justify-center gap-2">
				{#each coins as c}
					<div
						class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white"
					>
						{c}
					</div>
				{/each}
			</div>

			<div class="mt-4 space-y-2 text-center">
				{#if computed && answer !== null}
					<div class="text-lg font-semibold text-white">
						Min coins for {amount} = {answer}
					</div>
				{:else}
					<div class="text-sm text-[color:var(--color-landingpage-subtitle)]">
						Run to compute dp array and the answer.
					</div>
				{/if}
			</div>

			{#if computed}
				<div class="mt-4 flex flex-wrap justify-center gap-2">
					{#each dp as v, i}
						<div class="flex flex-col items-center gap-1">
							<div class="text-[11px] text-slate-300">{i}</div>
							<div
								class="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 font-extrabold text-white"
							>
								{v === Number.POSITIVE_INFINITY ? '∞' : v}
							</div>
						</div>
					{/each}
				</div>
			{/if}

			<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
				<div class="flex items-center gap-2">
					<label class="text-sm text-white" for="cc-amt">Amount</label>
					<input
						id="cc-amt"
						type="number"
						min="0"
						max="60"
						value={amount}
						oninput={(e) =>
							(amount = Math.max(
								0,
								Math.min(60, Number((e.target as HTMLInputElement).value) || 0)
							))}
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
