<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/lcs.java';

	let s1 = $state('ABCDGH');
	let s2 = $state('AEDFHR');

	let table = $state<number[][]>([]);
	let lcs = $state('');

	let running = $state(false);
	let started = $state(false);
	let done = $state(false);

	let phase = $state<'fill' | 'trace'>('fill');
	let iCur = $state<number | null>(null);
	let jCur = $state<number | null>(null);
	let info = $state('');

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		table = [];
		lcs = '';

		running = false;
		started = false;
		done = false;

		phase = 'fill';
		iCur = null;
		jCur = null;
		info = '';
	}

	function clampStr(x: string, max: number) {
		const t = (x || '').toUpperCase();
		return t.length > max ? t.slice(0, max) : t;
	}

	function run() {
		if (running) return;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		const a = clampStr(s1, 12);
		const b = clampStr(s2, 12);
		s1 = a;
		s2 = b;

		const m = a.length;
		const n = b.length;

		const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

		const steps: Array<{
			table: number[][];
			phase: 'fill' | 'trace';
			i: number | null;
			j: number | null;
			info: string;
			lcs: string;
			done: boolean;
		}> = [];

		steps.push({
			table: dp.map((r) => r.slice()),
			phase: 'fill',
			i: 0,
			j: 0,
			info: 'Start with all zeros (empty prefixes).',
			lcs: '',
			done: false
		});

		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				const ca = a[i - 1];
				const cb = b[j - 1];

				if (ca === cb) {
					dp[i][j] = dp[i - 1][j - 1] + 1;
					steps.push({
						table: dp.map((r) => r.slice()),
						phase: 'fill',
						i,
						j,
						info: `Match '${ca}'. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
						lcs: '',
						done: false
					});
				} else {
					const top = dp[i - 1][j];
					const left = dp[i][j - 1];
					dp[i][j] = top >= left ? top : left;
					steps.push({
						table: dp.map((r) => r.slice()),
						phase: 'fill',
						i,
						j,
						info: `No match ('${ca}' vs '${cb}'). dp[${i}][${j}] = max(top ${top}, left ${left}) = ${dp[i][j]}`,
						lcs: '',
						done: false
					});
				}
			}
		}

		let i = m;
		let j = n;
		let res = '';

		steps.push({
			table: dp.map((r) => r.slice()),
			phase: 'trace',
			i,
			j,
			info: 'Trace back from bottom-right to reconstruct one LCS.',
			lcs: res,
			done: false
		});

		while (i > 0 && j > 0) {
			const ca = a[i - 1];
			const cb = b[j - 1];

			if (ca === cb) {
				res = ca + res;
				steps.push({
					table: dp.map((r) => r.slice()),
					phase: 'trace',
					i,
					j,
					info: `Match '${ca}'. Keep it and move diagonally to (${i - 1}, ${j - 1}).`,
					lcs: res,
					done: false
				});
				i -= 1;
				j -= 1;
			} else {
				const top = dp[i - 1][j];
				const left = dp[i][j - 1];
				if (top >= left) {
					steps.push({
						table: dp.map((r) => r.slice()),
						phase: 'trace',
						i,
						j,
						info: `Move up because top ${top} >= left ${left}.`,
						lcs: res,
						done: false
					});
					i -= 1;
				} else {
					steps.push({
						table: dp.map((r) => r.slice()),
						phase: 'trace',
						i,
						j,
						info: `Move left because left ${left} > top ${top}.`,
						lcs: res,
						done: false
					});
					j -= 1;
				}
			}
		}

		steps.push({
			table: dp.map((r) => r.slice()),
			phase: 'trace',
			i: null,
			j: null,
			info: ``,
			lcs: res,
			done: true
		});

		reset();
		started = true;
		running = true;
		done = false;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				table = steps[idx].table;
				phase = steps[idx].phase;
				iCur = steps[idx].i;
				jCur = steps[idx].j;
				info = steps[idx].info;
				lcs = steps[idx].lcs;
				done = steps[idx].done;
				idx += 1;
			} else {
				running = false;
				iCur = null;
				jCur = null;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 250);
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
			<div class="text-lg font-bold text-white">Longest Common Subsequence (LCS)</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				dp[i][j] is the LCS length of the first i letters of String 1 and the first j letters of
				String 2.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="grid gap-3">
					<div class="flex flex-wrap items-center justify-center gap-3">
						<label class="text-sm text-white" for="lcs-s1">String 1</label>
						<input
							id="lcs-s1"
							type="text"
							value={s1}
							oninput={(e) => (s1 = ((e.target as HTMLInputElement).value || '').toUpperCase())}
							class="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
						/>
					</div>

					<div class="flex flex-wrap items-center justify-center gap-3">
						<label class="text-sm text-white" for="lcs-s2">String 2</label>
						<input
							id="lcs-s2"
							type="text"
							value={s2}
							oninput={(e) => (s2 = ((e.target as HTMLInputElement).value || '').toUpperCase())}
							class="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-white"
						/>
					</div>
				</div>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if started}
						<div class="font-semibold text-white">
							{phase === 'fill' ? 'Filling the DP table' : 'Tracing back to build the subsequence'}
						</div>
						<div class="mt-1 text-slate-200">{info}</div>
						{#if lcs.length}
							<div class="mt-2 font-semibold text-white">Current LCS: "{lcs}"</div>
						{/if}
						{#if done}
							<div class="mt-2 text-lg font-semibold text-white">
								Final LCS: "{lcs}" (Length {lcs.length})
							</div>
						{/if}
					{:else}
						Run to see both the table fill and the traceback.
					{/if}
				</div>

				{#if started && table.length}
					<div class="mt-4 overflow-x-auto">
						<table class="mx-auto border-collapse text-sm">
							<thead>
								<tr>
									<th class="border border-white/10 px-2 py-1 text-slate-300"></th>
									<th class="border border-white/10 px-2 py-1 text-slate-300"></th>
									{#each s2.split('') as ch}
										<th class="border border-white/10 px-2 py-1 text-slate-300">{ch}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each table as row, i}
									<tr>
										<th class="border border-white/10 px-2 py-1 text-slate-300"
											>{i === 0 ? '' : s1[i - 1]}</th
										>
										{#each row as cell, j}
											<td
												class={[
													'border border-white/10 px-2 py-1 text-center transition',
													iCur === i && jCur === j
														? phase === 'fill'
															? 'bg-amber-500/40 font-semibold text-white'
															: 'bg-pink-500/40 font-semibold text-white'
														: 'bg-white/5 text-white'
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
