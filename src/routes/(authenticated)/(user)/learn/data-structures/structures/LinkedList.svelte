<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/linked-list.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	type ListNode = { value: number; next: number | null };

	let linkedList = $state<ListNode[]>([
		{ value: 10, next: 1 },
		{ value: 20, next: 2 },
		{ value: 30, next: null }
	]);

	let llInput = $state('');

	function append() {
		const v = parseInt(llInput, 10);
		if (Number.isNaN(v)) {
			llInput = '';
			return;
		}
		const newList = [...linkedList];
		if (newList.length > 0) {
			newList[newList.length - 1] = { ...newList[newList.length - 1], next: newList.length };
		}
		newList.push({ value: v, next: null });
		linkedList = newList;
		llInput = '';
	}

	function removeLast() {
		if (linkedList.length === 0) return;
		const newList = linkedList.slice(0, -1);
		if (newList.length > 0)
			newList[newList.length - 1] = { ...newList[newList.length - 1], next: null };
		linkedList = newList;
	}

	function reset() {
		linkedList = [
			{ value: 10, next: 1 },
			{ value: 20, next: 2 },
			{ value: 30, next: null }
		];
		llInput = '';
	}
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-7 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-xl font-black tracking-wide text-white">Linked List</div>
			<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Nodes point to the next node. Great for insertions when you already have a reference to the
				position.
			</p>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex flex-wrap items-center justify-center gap-4">
					{#each linkedList as node}
						<div class="flex items-center gap-4">
							<div
								class="flex h-20 w-20 flex-col items-center justify-center rounded-xl border border-white/10 bg-purple-600/60 text-white"
							>
								<div class="text-xs text-purple-200">Node</div>
								<div class="text-2xl font-bold">{node.value}</div>
								<div class="text-xs text-purple-200">
									{node.next === null ? 'next: null' : 'next: →'}
								</div>
							</div>
							{#if node.next !== null}
								<div class="text-2xl font-bold text-purple-300">→</div>
							{/if}
						</div>
					{/each}
				</div>

				<div class="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
					<div class="space-y-1">
						<label
							class="text-xs font-semibold tracking-wider text-white/70 uppercase"
							for="llValue"
						>
							Value
						</label>
						<input
							id="llValue"
							type="number"
							bind:value={llInput}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
							placeholder="e.g. 42"
						/>
					</div>

					<button
						type="button"
						onclick={append}
						class="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white"
					>
						<Icons name="plus" />
						<span>Append</span>
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
