<script lang="ts">
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/insertion.java';

	const initial = [12, 11, 13, 5, 6];

	let arr = $state<number[]>([...initial]);
	let running = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		running = false;
		arr = [...initial];
	}

	function run() {
		if (running) return;
		running = true;

		const a = [...arr];
		const steps: number[][] = [];

		for (let i = 1; i < a.length; i++) {
			const key = a[i];
			let j = i - 1;
			while (j >= 0 && a[j] > key) {
				a[j + 1] = a[j];
				j -= 1;
				steps.push([...a]);
			}
			a[j + 1] = key;
			steps.push([...a]);
		}

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				arr = steps[idx];
				idx += 1;
			} else {
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
				running = false;
			}
		}, 550);
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Insertion Sort</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Grows a sorted prefix by inserting each next element into its correct position.
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="flex items-end justify-center gap-2" style="height: 260px;">
				{#each arr as v, i (i)}
					<div
						class="w-14 rounded-t-lg border border-white/10 bg-white/10 text-center text-sm font-bold text-white"
						style={`height:${Math.max(60, Math.round((v / Math.max(...arr)) * 220))}px;`}
					>
						<div class="mt-2">{v}</div>
					</div>
				{/each}
			</div>

			<div class="mt-5 flex flex-wrap justify-center gap-3">
				<button
					type="button"
					onclick={run}
					disabled={running}
					class="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
