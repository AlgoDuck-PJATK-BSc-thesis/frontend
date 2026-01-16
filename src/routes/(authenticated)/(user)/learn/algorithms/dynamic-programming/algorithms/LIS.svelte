<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/lis.java';

	let raw = $state('10, 9, 2, 5, 3, 7, 101, 18');
	let arr = $state<number[]>([10, 9, 2, 5, 3, 7, 101, 18]);

	let dp = $state<number[]>([]);
	let best = $state<number | null>(null);

	let running = $state(false);
	let started = $state(false);
	let done = $state(false);

	let iCur = $state<number | null>(null);
	let jCur = $state<number | null>(null);
	let updated = $state(false);
	let info = $state('');

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function resetAnim() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		dp = [];
		best = null;

		running = false;
		started = false;
		done = false;

		iCur = null;
		jCur = null;
		updated = false;
		info = '';
	}

	function resetAll() {
		resetAnim();
		raw = '10, 9, 2, 5, 3, 7, 101, 18';
		arr = [10, 9, 2, 5, 3, 7, 101, 18];
	}

	function parse() {
		const nums = raw
			.split(',')
			.map((x) => x.trim())
			.filter((x) => x.length)
			.map((x) => Number(x))
			.filter((x) => Number.isFinite(x));
		arr = nums.length ? nums.slice(0, 18) : [10, 9, 2, 5, 3, 7, 101, 18];
		raw = arr.join(', ');
	}

	function run() {
		if (running) return;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		parse();
		const n = arr.length;

		if (n === 0) {
			resetAnim();
			dp = [];
			best = 0;
			started = true;
			done = true;
			return;
		}

		const d = Array(n).fill(1);

		const steps: Array<{
			dp: number[];
			best: number;
			iCur: number | null;
			jCur: number | null;
			updated: boolean;
			info: string;
			done: boolean;
		}> = [];

		let curBest = 1;

		steps.push({
			dp: d.slice(),
			best: curBest,
			iCur: 0,
			jCur: null,
			updated: false,
			info: 'Start: every element alone makes an increasing subsequence of length 1.',
			done: false
		});

		for (let i = 1; i < n; i++) {
			steps.push({
				dp: d.slice(),
				best: curBest,
				iCur: i,
				jCur: null,
				updated: false,
				info: `Now compute dp[${i}] (best LIS that ends at value ${arr[i]}).`,
				done: false
			});

			for (let j = 0; j < i; j++) {
				let did = false;
				let msg = '';

				if (arr[i] > arr[j]) {
					const cand = d[j] + 1;
					if (cand > d[i]) {
						d[i] = cand;
						did = true;
						msg = `Because ${arr[i]} > ${arr[j]}, extend: dp[${i}] = max(dp[${i}], dp[${j}] + 1) = ${d[i]}.`;
					} else {
						msg = `Because ${arr[i]} > ${arr[j]}, candidate ${cand} does not beat dp[${i}] = ${d[i]}.`;
					}
				} else {
					msg = `${arr[i]} is not greater than ${arr[j]}, so we cannot extend that subsequence.`;
				}

				if (d[i] > curBest) curBest = d[i];

				steps.push({
					dp: d.slice(),
					best: curBest,
					iCur: i,
					jCur: j,
					updated: did,
					info: msg,
					done: false
				});
			}
		}

		steps.push({
			dp: d.slice(),
			best: curBest,
			iCur: null,
			jCur: null,
			updated: false,
			info: `Done. LIS length = ${curBest}.`,
			done: true
		});

		resetAnim();
		started = true;
		running = true;
		done = false;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				dp = steps[idx].dp;
				best = steps[idx].best;
				iCur = steps[idx].iCur;
				jCur = steps[idx].jCur;
				updated = steps[idx].updated;
				info = steps[idx].info;
				done = steps[idx].done;
				idx += 1;
			} else {
				running = false;
				iCur = null;
				jCur = null;
				updated = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 320);
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
			<div class="text-lg font-bold text-white">Longest Increasing Subsequence (DP)</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				dp[i] means: the LIS length that ends exactly at index i. We try to extend earlier
				subsequences.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex flex-wrap items-center justify-center gap-3">
					<label class="text-sm text-white" for="lis-arr">Array</label>
					<input
						id="lis-arr"
						type="text"
						value={raw}
						oninput={(e) => (raw = (e.target as HTMLInputElement).value)}
						class="w-full max-w-xl rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
					/>
				</div>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if started}
						<div class="font-semibold text-white">{info}</div>
						{#if best !== null}
							<div class="mt-2 text-white">Current best = {best}</div>
						{/if}
					{:else}
						Run to see dp updates while comparing each pair (j, i).
					{/if}
				</div>

				{#if started}
					<div class="mt-4 overflow-x-auto">
						<table class="mx-auto border-collapse text-sm">
							<thead>
								<tr>
									<th class="border border-white/10 px-3 py-2 text-slate-300">i</th>
									{#each arr as _, i}
										<th class="border border-white/10 px-3 py-2 text-slate-300">{i}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								<tr>
									<th class="border border-white/10 px-3 py-2 text-slate-300">a[i]</th>
									{#each arr as v, i}
										<td
											class={[
												'border border-white/10 px-3 py-2 text-center text-white transition',
												i === iCur
													? 'bg-amber-500/40 font-semibold'
													: i === jCur
														? 'bg-sky-500/30 font-semibold'
														: 'bg-white/5'
											].join(' ')}
										>
											{v}
										</td>
									{/each}
								</tr>
								<tr>
									<th class="border border-white/10 px-3 py-2 text-slate-300">dp[i]</th>
									{#each dp as v, i}
										<td
											class={[
												'border border-white/10 px-3 py-2 text-center text-white transition',
												i === iCur
													? updated
														? 'bg-emerald-500/40 font-semibold'
														: 'bg-amber-500/30 font-semibold'
													: 'bg-white/5'
											].join(' ')}
										>
											{v}
										</td>
									{/each}
								</tr>
							</tbody>
						</table>
					</div>
				{/if}

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
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
						onclick={resetAll}
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
