<script lang="ts">
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/heap.java';

	const initial = [12, 11, 13, 5, 6, 7];

	let arr = $state<number[]>([...initial]);

	function reset() {
		arr = [...initial];
	}

	function run() {
		arr = [...arr].sort((a, b) => a - b);
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Heap Sort</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Build a heap, then repeatedly extract the maximum/minimum.
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
					class="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2 font-semibold text-white"
				>
					<Icons name="play" />
					<span>Sort</span>
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
