<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/bellman-ford.java';

	const nodes = ['A', 'B', 'C', 'D', 'E'];
	const edges = [
		{ a: 'A', b: 'B', w: 4 },
		{ a: 'A', b: 'C', w: 2 },
		{ a: 'C', b: 'D', w: 3 },
		{ a: 'B', b: 'D', w: 5 },
		{ a: 'D', b: 'E', w: 1 },
		{ a: 'B', b: 'E', w: 10 }
	];

	let dist = $state<Record<string, number> | null>(null);
	let pass = $state(0);
	let running = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		dist = null;
		pass = 0;
		running = false;
	}

	function run() {
		if (running) return;

		const d: Record<string, number> = { A: 0, B: Infinity, C: Infinity, D: Infinity, E: Infinity };
		const steps: Array<{ pass: number; dist: Record<string, number> }> = [
			{ pass: 0, dist: { ...d } }
		];

		for (let i = 1; i <= nodes.length - 1; i++) {
			for (const e of edges) {
				if (d[e.a] !== Infinity) {
					const nd = d[e.a] + e.w;
					if (nd < d[e.b]) d[e.b] = nd;
				}
				if (d[e.b] !== Infinity) {
					const nd = d[e.b] + e.w;
					if (nd < d[e.a]) d[e.a] = nd;
				}
			}
			steps.push({ pass: i, dist: { ...d } });
		}

		reset();
		running = true;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				pass = steps[idx].pass;
				dist = steps[idx].dist;
				idx += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 800);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Bellman–Ford</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Shortest paths via repeated edge relaxation. Handles negative weights (and can detect negative
			cycles).
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
				{#if dist}
					{@const d = dist}
					<div class="font-semibold text-white">Pass {pass}</div>
					<div class="mt-2 text-slate-200">
						{nodes.map((n) => `${n}=${d[n] === Infinity ? '∞' : d[n]}`).join(', ')}
					</div>
				{:else}
					Run to see relaxation passes.
				{/if}
			</div>

			<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					onclick={run}
					disabled={running}
					class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
