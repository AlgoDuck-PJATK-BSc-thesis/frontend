<script lang="ts">
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/lcs.java';

	let s1 = $state('ABCDGH');
	let s2 = $state('AEDFHR');

	let table = $state<number[][]>([]);
	let lcs = $state('');
	let computed = $state(false);

	function reset() {
		table = [];
		lcs = '';
		computed = false;
	}

	function run() {
		const a = (s1 || '').toUpperCase();
		const b = (s2 || '').toUpperCase();
		s1 = a;
		s2 = b;

		const m = a.length;
		const n = b.length;

		const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

		for (let i = 1; i <= m; i++) {
			for (let j = 1; j <= n; j++) {
				if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
				else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
			}
		}

		let i = m;
		let j = n;
		let res = '';

		while (i > 0 && j > 0) {
			if (a[i - 1] === b[j - 1]) {
				res = a[i - 1] + res;
				i -= 1;
				j -= 1;
			} else if (dp[i - 1][j] >= dp[i][j - 1]) i -= 1;
			else j -= 1;
		}

		table = dp;
		lcs = res;
		computed = true;
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Longest Common Subsequence</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			DP table stores best LCS length for prefixes of both strings.
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

			{#if computed}
				<div class="mt-4 space-y-2 text-center">
					<div class="font-semibold text-white">
						LCS: "{lcs}" (Length: {lcs.length})
					</div>
				</div>

				<div class="mt-4 overflow-x-auto">
					<table class="mx-auto border-collapse">
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
									<th class="border border-white/10 px-2 py-1 text-slate-300">
										{i === 0 ? '' : s1[i - 1]}
									</th>
									{#each row as cell}
										<td
											class={[
												'border border-white/10 px-2 py-1 text-center',
												cell > 0 ? 'bg-white/5 font-semibold text-white' : 'text-slate-400'
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
			{:else}
				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					Run to build the DP table and reconstruct the subsequence.
				</div>
			{/if}

			<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
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
