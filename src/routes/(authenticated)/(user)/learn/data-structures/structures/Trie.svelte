<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/trie.java';

	function seed() {
		return ['cat', 'car', 'card', 'care', 'dog', 'dodge'].sort((a, b) => a.localeCompare(b));
	}

	let words = $state<string[]>(seed());
	let addWord = $state('');
	let prefix = $state('');

	let filtered = $derived(
		prefix.trim().length === 0
			? words
			: words.filter((w) => w.startsWith(prefix.trim().toLowerCase()))
	);

	function add() {
		const w = addWord.trim().toLowerCase();
		if (!w) {
			addWord = '';
			return;
		}
		if (!words.includes(w)) words = [...words, w].sort((a, b) => a.localeCompare(b));
		addWord = '';
	}

	function reset() {
		words = seed();
		addWord = '';
		prefix = '';
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-xl font-black tracking-wide text-white">Trie</div>
		<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Prefix tree for fast word lookup and autocomplete.
		</p>

		<div class="mt-6 space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="grid gap-3 md:grid-cols-2">
				<div class="space-y-1">
					<label
						class="text-xs font-semibold tracking-wider text-white/70 uppercase"
						for="triePrefix"
					>
						Prefix
					</label>
					<input
						id="triePrefix"
						type="text"
						bind:value={prefix}
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
						placeholder="e.g. ca"
					/>
				</div>

				<div class="space-y-1">
					<label class="text-xs font-semibold tracking-wider text-white/70 uppercase" for="trieAdd">
						Add word
					</label>
					<input
						id="trieAdd"
						type="text"
						bind:value={addWord}
						class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
						placeholder="e.g. cart"
					/>
				</div>
			</div>

			<div class="flex flex-wrap justify-center gap-2">
				<button
					type="button"
					onclick={add}
					class="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2 font-semibold text-white"
				>
					<Icons name="plus" />
					<span>Add</span>
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

			<div class="text-center text-xs text-[color:var(--color-landingpage-subtitle)]">
				Showing {filtered.length} of {words.length}
			</div>

			<div class="flex flex-wrap justify-center gap-2">
				{#each filtered as w}
					<div
						class="rounded-xl border border-white/10 bg-pink-600/40 px-3 py-2 text-sm font-semibold text-white"
					>
						{w}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<CodePanel {meta} {java} />
</div>
