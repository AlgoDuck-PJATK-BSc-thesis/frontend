<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/hash-table.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	type Entry = { key: string; value: string };

	const size = 10;

	let keyInput = $state('');
	let valueInput = $state('');

	let table = $state<Record<number, Entry[]>>(
		Object.fromEntries(Array.from({ length: size }, (_, i) => [i, []]))
	);

	function hash(key: string) {
		let h = 0;
		for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
		return h % size;
	}

	function put() {
		const k = keyInput.trim();
		const v = valueInput.trim();
		if (!k || !v) return;

		const idx = hash(k);
		const bucket = table[idx] ?? [];
		const existing = bucket.findIndex((e) => e.key === k);

		const nextBucket =
			existing >= 0
				? bucket.map((e, i) => (i === existing ? { key: k, value: v } : e))
				: [...bucket, { key: k, value: v }];

		table = { ...table, [idx]: nextBucket };
		keyInput = '';
		valueInput = '';
	}

	function removeKey(k: string) {
		const idx = hash(k);
		const bucket = table[idx] ?? [];
		table = { ...table, [idx]: bucket.filter((e) => e.key !== k) };
	}

	function reset() {
		table = Object.fromEntries(Array.from({ length: size }, (_, i) => [i, []]));
		keyInput = '';
		valueInput = '';
	}
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-7 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-xl font-black tracking-wide text-white">Hash Table</div>
			<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Key-value storage using a hash function and buckets.
			</p>

			<div class="mt-6 space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="grid gap-3 md:grid-cols-2">
					<div class="space-y-1">
						<label class="text-xs font-semibold tracking-wider text-white/70 uppercase" for="htKey">
							Key
						</label>
						<input
							id="htKey"
							type="text"
							bind:value={keyInput}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
							placeholder="e.g. duck"
						/>
					</div>
					<div class="space-y-1">
						<label
							class="text-xs font-semibold tracking-wider text-white/70 uppercase"
							for="htValue"
						>
							Value
						</label>
						<input
							id="htValue"
							type="text"
							bind:value={valueInput}
							class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
							placeholder="e.g. 42"
						/>
					</div>
				</div>

				<div class="flex flex-wrap justify-center gap-2">
					<button
						type="button"
						onclick={put}
						class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 font-semibold text-white"
					>
						<Icons name="plus" />
						<span>Put</span>
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

				<div class="grid gap-3 md:grid-cols-5">
					{#each Array.from({ length: size }, (_, i) => i) as i}
						<div class="rounded-2xl border border-white/10 bg-white/5 p-3">
							<div
								class="mb-2 flex items-center justify-between text-xs font-semibold text-white/80"
							>
								<span>Bucket {i}</span>
								<span class="text-[color:var(--color-landingpage-subtitle)]"
									>{(table[i] ?? []).length}</span
								>
							</div>

							<div class="space-y-2">
								{#each table[i] ?? [] as entry}
									<button
										type="button"
										onclick={() => removeKey(entry.key)}
										class="w-full rounded-xl border border-white/10 bg-emerald-600/30 px-3 py-2 text-left text-xs text-white"
									>
										<div class="font-bold">{entry.key}</div>
										<div class="text-white/80">{entry.value}</div>
									</button>
								{/each}

								{#if (table[i] ?? []).length === 0}
									<div class="text-xs text-[color:var(--color-landingpage-subtitle)]">Empty</div>
								{/if}
							</div>
						</div>
					{/each}
				</div>

				<div class="text-center text-xs text-[color:var(--color-landingpage-subtitle)]">
					Click an entry to remove it from its bucket.
				</div>
			</div>
		</div>

		<CodePanel {meta} {java} />
	</div>
</PixelFrameSimple>
