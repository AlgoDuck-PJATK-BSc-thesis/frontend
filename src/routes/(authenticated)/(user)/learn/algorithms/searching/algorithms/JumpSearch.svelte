<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/jump.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	const initial = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

	let arr = $state<number[]>([...initial]);
	let target = $state('55');

	let searching = $state(false);
	let current = $state(-1);
	let found = $state<number | null>(null);
	let status = $state('Enter a target and run the search.');

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		arr = [...initial];
		target = '55';

		searching = false;
		current = -1;
		found = null;
		status = 'Enter a target and run the search.';
	}

	function run() {
		if (searching) return;

		const t = Number.parseInt(target, 10);
		if (Number.isNaN(t)) return;

		if (intervalId) clearInterval(intervalId);
		intervalId = null;

		searching = true;
		found = null;
		current = -1;
		status = 'Searching...';

		const a = arr;
		const n = a.length;

		if (n === 0) {
			found = -1;
			searching = false;
			status = 'Not found.';
			return;
		}

		const step = Math.max(1, Math.floor(Math.sqrt(n)));

		let prev = 0;
		let curr = step;

		const steps: number[] = [];
		let hit = -1;

		while (prev < n && a[Math.min(curr, n) - 1] < t) {
			steps.push(Math.min(curr, n) - 1);
			prev = curr;
			curr += step;
			if (prev >= n) break;
		}

		const end = Math.min(curr, n);
		for (let i = prev; i < end; i++) {
			steps.push(i);
			if (a[i] === t) {
				hit = i;
				break;
			}
		}

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				current = steps[i];
				status = `Check index ${current} (value ${a[current]})`;

				if (hit !== -1 && current === hit) {
					found = hit;
					searching = false;
					status = `Found at index ${hit}.`;
					if (intervalId) clearInterval(intervalId);
					intervalId = null;
					return;
				}

				i += 1;
				return;
			}

			found = -1;
			searching = false;
			current = -1;
			status = 'Not found.';
			if (intervalId) clearInterval(intervalId);
			intervalId = null;
		}, 550);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-8 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-lg font-bold text-white">Jump Search</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Jumps by √n blocks, then does a linear scan inside the block (sorted arrays).
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="mb-3 text-center text-xs text-[color:var(--color-landingpage-subtitle)]">
					{status}
				</div>

				<div class="flex flex-wrap items-center justify-center gap-2">
					{#each arr as v, i (i)}
						<div
							class={[
								'flex h-14 w-14 items-center justify-center rounded-xl border text-xs font-bold transition',
								found === i
									? 'border-emerald-300 bg-emerald-500/40 text-white'
									: current === i
										? 'border-yellow-300 bg-yellow-500/40 text-white'
										: 'border-white/10 bg-white/10 text-white'
							].join(' ')}
						>
							{v}
						</div>
					{/each}
				</div>

				<div class="mt-4 text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{#if found === null}
						Enter a target and run the search.
					{:else if found === -1}
						<span class="font-semibold text-red-300">Not found</span>
					{:else}
						<span class="font-semibold text-emerald-300">Found at index {found}</span>
					{/if}
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
					<input
						type="number"
						class="w-28 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2 text-white"
						bind:value={target}
						placeholder="Target"
					/>

					<button
						type="button"
						onclick={run}
						disabled={searching}
						class="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
					>
						<Icons name="search" />
						<span>Search</span>
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
</PixelFrameSimple>
