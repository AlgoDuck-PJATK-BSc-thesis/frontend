<script lang="ts">
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/lis.java';

	let raw = $state('10, 9, 2, 5, 3, 7, 101, 18');
	let arr = $state<number[]>([10, 9, 2, 5, 3, 7, 101, 18]);

	let dp = $state<number[]>([]);
	let best = $state<number | null>(null);
	let computed = $state(false);

	function reset() {
		raw = '10, 9, 2, 5, 3, 7, 101, 18';
		arr = [10, 9, 2, 5, 3, 7, 101, 18];
		dp = [];
		best = null;
		computed = false;
	}

	function parse() {
		const nums = raw
			.split(',')
			.map((x) => x.trim())
			.filter((x) => x.length)
			.map((x) => Number(x))
			.filter((x) => Number.isFinite(x));

		arr = nums.length ? nums.slice(0, 18) : [10, 9, 2, 5, 3, 7, 101, 18];
	}

	function run() {
		parse();
		const n = arr.length;
		if (n === 0) {
			dp = [];
			best = 0;
			computed = true;
			return;
		}

		const d = Array(n).fill(1);

		for (let i = 1; i < n; i++) {
			for (let j = 0; j < i; j++) {
				if (arr[i] > arr[j]) d[i] = Math.max(d[i], d[j] + 1);
			}
		}

		dp = d;
		best = Math.max(...d);
		computed = true;
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Longest Increasing Subsequence</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			dp[i] = LIS length ending at i.
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

			{#if computed && best !== null}
				<div class="mt-4 text-center text-lg font-semibold text-white">LIS length = {best}</div>
			{:else}
				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					Run to compute dp[] and the LIS length.
				</div>
			{/if}

			{#if computed}
				<div class="mt-4 overflow-x-auto">
					<table class="mx-auto border-collapse">
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
								{#each arr as v}
									<td class="border border-white/10 px-3 py-2 text-center text-white">{v}</td>
								{/each}
							</tr>
							<tr>
								<th class="border border-white/10 px-3 py-2 text-slate-300">dp[i]</th>
								{#each dp as v}
									<td
										class="border border-white/10 bg-white/5 px-3 py-2 text-center font-semibold text-white"
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
