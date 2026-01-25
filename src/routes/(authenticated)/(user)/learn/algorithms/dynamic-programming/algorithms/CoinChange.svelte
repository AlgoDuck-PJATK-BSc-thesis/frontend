<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/coin-change.java';
	import Arrow from '$lib/Components/Misc/Arrow.svelte';

	const coins = [1, 2, 5] as const;

	let amount = $state(11);

	let dp = $state<number[]>([]);
	let answer = $state<number | null>(null);

	let running = $state(false);
	let started = $state(false);
	let done = $state(false);

	let currentX = $state<number | null>(null);
	let currentCoin = $state<number | null>(null);
	let fromX = $state<number | null>(null);
	let candidate = $state<number | null>(null);
	let updated = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function INF() {
		return Number.POSITIVE_INFINITY;
	}

	function fmt(v: number) {
		return v === INF() ? 'INF' : String(v);
	}

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		dp = [];
		answer = null;

		running = false;
		started = false;
		done = false;

		currentX = null;
		currentCoin = null;
		fromX = null;
		candidate = null;
		updated = false;
	}

	function run() {
		if (running) return;

		const A = Math.max(0, Math.min(60, amount));
		amount = A;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		const arr: number[] = Array(A + 1).fill(INF());
		arr[0] = 0;

		const steps: Array<{
			dp: number[];
			currentX: number | null;
			currentCoin: number | null;
			fromX: number | null;
			candidate: number | null;
			updated: boolean;
			done: boolean;
			answer: number | null;
		}> = [];

		steps.push({
			dp: arr.slice(),
			currentX: 0,
			currentCoin: null,
			fromX: null,
			candidate: null,
			updated: false,
			done: false,
			answer: null
		});

		for (let x = 1; x <= A; x++) {
			for (const c of coins) {
				let didUpdate = false;
				let cand: number | null = null;
				let fx: number | null = null;

				if (c <= x && arr[x - c] !== INF()) {
					fx = x - c;
					cand = arr[x - c] + 1;
					if (cand < arr[x]) {
						arr[x] = cand;
						didUpdate = true;
					}
				}

				steps.push({
					dp: arr.slice(),
					currentX: x,
					currentCoin: c,
					fromX: fx,
					candidate: cand,
					updated: didUpdate,
					done: false,
					answer: null
				});
			}
		}

		const ans = arr[A] === INF() ? -1 : arr[A];

		steps.push({
			dp: arr.slice(),
			currentX: A,
			currentCoin: null,
			fromX: null,
			candidate: null,
			updated: false,
			done: true,
			answer: ans
		});

		reset();
		started = true;
		running = true;
		done = false;

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				dp = steps[i].dp;
				currentX = steps[i].currentX;
				currentCoin = steps[i].currentCoin;
				fromX = steps[i].fromX;
				candidate = steps[i].candidate;
				updated = steps[i].updated;
				done = steps[i].done;
				answer = steps[i].answer;
				i += 1;
			} else {
				running = false;
				currentX = null;
				currentCoin = null;
				fromX = null;
				candidate = null;
				updated = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 600);
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
			<div class="text-lg font-bold text-white">Coin Change (Min Coins)</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				dp[x] means: the fewest coins needed to make amount x. We start with dp[0]=0 and everything
				else as INF (not possible yet).
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex flex-wrap justify-center gap-2">
					{#each coins as c}
						<div
							class="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-semibold text-white"
						>
							coin {c}
						</div>
					{/each}
				</div>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if started}
						{#if done && answer !== null}
							<div class="text-lg font-semibold text-white">
								Answer: {answer === -1 ? 'Not possible' : `${answer} coin(s)`}
							</div>
						{:else if currentX !== null && currentCoin !== null}
							<div class="font-semibold text-white">
								Compute dp[{currentX}] using coin {currentCoin}
							</div>
							{#if fromX !== null && candidate !== null}
								<div class="mt-1 text-slate-200">
									Try: dp[{fromX}] + 1 = {fmt(dp[fromX])} + 1 = {candidate}
									<span class="mx-1 inline-flex translate-y-[3px] opacity-90">
										<Arrow size={14} stroke="currentColor" />
									</span>
									{updated ? 'update dp' : 'no change'}
								</div>
							{:else}
								<div class="mt-1 text-slate-200">Coin too large or previous amount is INF</div>
							{/if}
						{:else}
							<div class="text-slate-200">Filling the table...</div>
						{/if}
					{:else}
						Run to watch dp fill from 0 up to the target.
					{/if}
				</div>

				{#if started}
					<div class="mt-4 flex flex-wrap justify-center gap-2">
						{#each dp as v, i}
							<div class="flex flex-col items-center gap-1">
								<div class="text-[11px] text-slate-300">{i}</div>
								<div
									class={[
										'flex h-12 w-12 items-center justify-center rounded-xl border font-extrabold text-white transition',
										i === currentX
											? updated
												? 'border-emerald-300 bg-emerald-500/40'
												: 'border-amber-300 bg-amber-500/40'
											: fromX !== null && i === fromX
												? 'border-sky-300 bg-sky-500/30'
												: 'border-white/10 bg-white/5'
									].join(' ')}
								>
									{fmt(v)}
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
