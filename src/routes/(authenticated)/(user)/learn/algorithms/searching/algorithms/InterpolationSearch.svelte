<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/interpolation.java';

	const initial = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

	let arr = $state<number[]>([...initial]);
	let target = $state('70');

	let searching = $state(false);
	let current = $state(-1);
	let found = $state<number | null>(null);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		arr = [...initial];
		target = '70';
		searching = false;
		current = -1;
		found = null;
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

		let l = 0;
		let r = arr.length - 1;

		const steps: number[] = [];

		while (l <= r && t >= arr[l] && t <= arr[r]) {
			if (arr[l] === arr[r]) {
				steps.push(l);
				break;
			}

			const pos = l + Math.floor(((t - arr[l]) * (r - l)) / (arr[r] - arr[l]));
			steps.push(pos);

			if (arr[pos] === t) break;
			if (arr[pos] < t) l = pos + 1;
			else r = pos - 1;
		}

		let i = 0;
		intervalId = setInterval(() => {
			if (i < steps.length) {
				current = steps[i];
				if (arr[current] === t) {
					found = current;
					searching = false;
					if (intervalId) clearInterval(intervalId);
					intervalId = null;
				}
				i += 1;
			} else {
				found = -1;
				searching = false;
				current = -1;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 600);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Interpolation Search</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Estimates the position using value distribution (best on uniformly distributed sorted arrays).
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="flex flex-wrap items-center justify-center gap-2">
				{#each arr as v, i (i)}
					<div
						class={[
							'flex h-16 w-16 items-center justify-center rounded-xl border text-sm font-bold transition',
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
					class="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
