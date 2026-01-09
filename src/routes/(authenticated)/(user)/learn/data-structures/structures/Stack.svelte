<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/stack.java';

	let stack = $state<number[]>([1, 2, 3]);
	let stackInput = $state('');

	let maxVal = $derived(Math.max(1, ...stack));

	function push() {
		const v = parseInt(stackInput, 10);
		if (!Number.isNaN(v)) stack = [...stack, v];
		stackInput = '';
	}

	function pop() {
		if (stack.length > 0) stack = stack.slice(0, -1);
	}

	function reset() {
		stack = [1, 2, 3];
		stackInput = '';
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-xl font-black tracking-wide text-white">Stack (LIFO)</div>
		<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Push adds to the top. Pop removes from the top.
		</p>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="flex h-56 items-end justify-center gap-2">
				{#each stack as item}
					<div
						class="flex w-16 items-center justify-center rounded-t-lg border border-white/10 bg-blue-600/70 text-lg font-bold text-white"
						style={`height:${Math.max(56, Math.round((item / maxVal) * 200))}px`}
					>
						{item}
					</div>
				{/each}
			</div>

			<div class="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
				<div class="space-y-1">
					<label
						class="text-xs font-semibold tracking-wider text-white/70 uppercase"
						for="stackValue"
					>
						Value
					</label>
					<input
						id="stackValue"
						type="number"
						bind:value={stackInput}
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
						placeholder="e.g. 7"
					/>
				</div>

				<button
					type="button"
					onclick={push}
					class="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white"
				>
					<Icons name="plus" />
					<span>Push</span>
				</button>

				<button
					type="button"
					onclick={pop}
					class="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2 font-semibold text-white"
				>
					<Icons name="minus" />
					<span>Pop</span>
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
