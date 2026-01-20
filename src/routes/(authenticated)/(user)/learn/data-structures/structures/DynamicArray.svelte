<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/dynamic-array.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	let arr = $state<number[]>([5, 2, 8, 1, 9]);

	function addRandom() {
		const v = Math.floor(Math.random() * 10) + 1;
		arr = [...arr, v];
	}

	function removeLast() {
		if (arr.length > 0) arr = arr.slice(0, -1);
	}

	function reset() {
		arr = [5, 2, 8, 1, 9];
	}
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-7 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-xl font-black tracking-wide text-white">Dynamic Array</div>
			<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Contiguous memory with resizing. Fast index access; append is amortized O(1).
			</p>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex flex-wrap items-center justify-center gap-2">
					{#each arr as item, idx}
						<div class="flex flex-col items-center">
							<div class="mb-1 text-xs text-orange-300">[{idx}]</div>
							<div
								class="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-orange-600/60 text-lg font-bold text-white"
							>
								{item}
							</div>
						</div>
					{/each}
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
					<button
						type="button"
						onclick={addRandom}
						class="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2 font-semibold text-white"
					>
						<Icons name="plus" />
						<span>Add random</span>
					</button>

					<button
						type="button"
						onclick={removeLast}
						class="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white"
					>
						<Icons name="minus" />
						<span>Remove</span>
					</button>

					<button
						type="button"
						onclick={reset}
						class="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-5 py-2 font-semibold text-white"
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
