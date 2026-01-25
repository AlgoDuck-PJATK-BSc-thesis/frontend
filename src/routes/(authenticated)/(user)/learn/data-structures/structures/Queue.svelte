<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/queue.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import Arrow from '$lib/Components/Misc/Arrow.svelte';

	let queue = $state<number[]>([1, 2, 3, 4]);
	let queueInput = $state('');

	function enqueue() {
		const v = parseInt(queueInput, 10);
		if (!Number.isNaN(v)) queue = [...queue, v];
		queueInput = '';
	}

	function dequeue() {
		if (queue.length > 0) queue = queue.slice(1);
	}

	function reset() {
		queue = [1, 2, 3, 4];
		queueInput = '';
	}
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-7 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-xl font-black tracking-wide text-white">Queue (FIFO)</div>
			<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Enqueue adds to the rear. Dequeue removes from the front.
			</p>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex flex-wrap items-center justify-center gap-3">
					<div class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
						<span>Front</span>
						<span class="inline-flex translate-y-[3px] opacity-90">
							<Arrow size={14} stroke="currentColor" />
						</span>
					</div>
					{#each queue as item}
						<div
							class="flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-emerald-600/60 text-lg font-bold text-white"
						>
							{item}
						</div>
					{/each}
					<div class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
						<span class="inline-flex translate-y-[3px] opacity-90">
							<Arrow size={14} class="rotate-180" stroke="currentColor" />
						</span>
						<span>Rear</span>
					</div>
				</div>

				<div class="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
					<div class="space-y-1">
						<label
							class="text-xs font-semibold tracking-wider text-white/70 uppercase"
							for="queueValue"
						>
							Value
						</label>
						<input
							id="queueValue"
							type="number"
							bind:value={queueInput}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
							placeholder="e.g. 9"
						/>
					</div>

					<button
						type="button"
						onclick={enqueue}
						class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white"
					>
						<Icons name="plus" />
						<span>Enqueue</span>
					</button>

					<button
						type="button"
						onclick={dequeue}
						class="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white"
					>
						<Icons name="minus" />
						<span>Dequeue</span>
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
