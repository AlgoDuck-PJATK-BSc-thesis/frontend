<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/fractional-knapsack.java';

	type Item = { name: string; weight: number; value: number };

	const items: Item[] = [
		{ name: 'A', weight: 10, value: 60 },
		{ name: 'B', weight: 20, value: 100 },
		{ name: 'C', weight: 30, value: 120 }
	];

	function ratio(i: Item) {
		return i.value / i.weight;
	}

	type Taken = { name: string; fraction: number; weight: number; value: number; ratio: number };

	let capacity = $state(50);
	let taken = $state<Taken[]>([]);
	let totalValue = $state<number | null>(null);
	let remaining = $state<number | null>(null);
	let considering = $state<string | null>(null);
	let message = $state(
		'Sort by value/weight ratio. Take the best ratio first (fractions allowed).'
	);
	let running = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	const capacityInputId = 'fractional-capacity';

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		taken = [];
		totalValue = null;
		remaining = null;
		considering = null;
		message = 'Sort by value/weight ratio. Take the best ratio first (fractions allowed).';
		running = false;
	}

	function used() {
		if (remaining === null) return 0;
		return capacity - remaining;
	}

	function pctUsed() {
		if (remaining === null) return 0;
		if (capacity <= 0) return 0;
		return (used() / capacity) * 100;
	}

	function run() {
		if (running) return;

		const sorted = [...items].sort((a, b) => ratio(b) - ratio(a));

		type Step = {
			considering: string | null;
			taken: Taken[];
			total: number;
			remaining: number;
			msg: string;
		};

		const steps: Step[] = [];

		let rem = capacity;
		let total = 0;
		let localTaken: Taken[] = [];

		steps.push({
			considering: null,
			taken: [],
			total: 0,
			remaining: rem,
			msg: `Capacity = ${capacity}. Start taking items in ratio order.`
		});

		for (const item of sorted) {
			if (rem <= 0) break;

			steps.push({
				considering: item.name,
				taken: [...localTaken],
				total,
				remaining: rem,
				msg: `Consider ${item.name} (ratio ${ratio(item).toFixed(2)}). Remaining capacity = ${rem}.`
			});

			if (item.weight <= rem) {
				localTaken = [
					...localTaken,
					{
						name: item.name,
						fraction: 1,
						weight: item.weight,
						value: item.value,
						ratio: ratio(item)
					}
				];
				total += item.value;
				rem -= item.weight;

				steps.push({
					considering: item.name,
					taken: [...localTaken],
					total,
					remaining: rem,
					msg: `Take all of ${item.name}. Remaining capacity = ${rem}.`
				});
			} else {
				const f = rem / item.weight;
				localTaken = [
					...localTaken,
					{
						name: item.name,
						fraction: f,
						weight: item.weight * f,
						value: item.value * f,
						ratio: ratio(item)
					}
				];
				total += item.value * f;
				rem = 0;

				steps.push({
					considering: item.name,
					taken: [...localTaken],
					total,
					remaining: rem,
					msg: `Take ${(f * 100).toFixed(0)}% of ${item.name} to fill the bag.`
				});
			}
		}

		steps.push({
			considering: null,
			taken: [...localTaken],
			total,
			remaining: rem,
			msg: `Done. Total value = ${total.toFixed(2)}.`
		});

		reset();
		running = true;

		considering = steps[0].considering;
		taken = steps[0].taken;
		totalValue = steps[0].total;
		remaining = steps[0].remaining;
		message = steps[0].msg;

		let idx = 1;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				considering = steps[idx].considering;
				taken = steps[idx].taken;
				totalValue = steps[idx].total;
				remaining = steps[idx].remaining;
				message = steps[idx].msg;
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

<PixelFrameSimple
	className="w-full px-4 pr-8 py-8 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-lg font-bold text-white">Fractional Knapsack</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Sort by value/weight ratio. Take as much as possible from the best item, fractions allowed.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{message}
				</div>

				<div class="mt-5 flex flex-wrap items-center justify-center gap-3">
					<label class="text-sm font-semibold text-white" for={capacityInputId}>Capacity</label>
					<input
						id={capacityInputId}
						type="number"
						value={capacity}
						min="1"
						oninput={(e) => {
							const v = Number((e.currentTarget as HTMLInputElement).value);
							capacity = Number.isFinite(v) ? Math.max(1, Math.floor(v)) : 1;
							reset();
						}}
						class="w-24 rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white"
					/>

					<button
						type="button"
						onclick={run}
						disabled={running}
						class="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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

				<div class="mt-6">
					<div class="text-center text-xs font-semibold tracking-wider text-white/70 uppercase">
						Items
					</div>
					<div class="mt-3 grid gap-3 sm:grid-cols-3">
						{#each [...items].sort((a, b) => ratio(b) - ratio(a)) as item}
							<div
								class={[
									'rounded-2xl border p-4',
									considering === item.name
										? 'border-yellow-300 bg-yellow-500/10'
										: 'border-white/10 bg-white/5'
								].join(' ')}
							>
								<div class="text-center text-lg font-bold text-white">{item.name}</div>
								<div class="mt-2 text-sm text-slate-200">Weight: {item.weight}</div>
								<div class="text-sm text-slate-200">Value: {item.value}</div>
								<div class="mt-1 text-sm font-semibold text-slate-100">
									Ratio: {ratio(item).toFixed(2)}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
					<div class="flex items-center justify-between text-sm">
						<div class="text-slate-200">Used</div>
						<div class="font-semibold text-white">
							{remaining === null ? '-' : `${used()} / ${capacity}`}
						</div>
					</div>

					<div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
						<div class="h-full bg-emerald-500" style={`width:${pctUsed()}%`}></div>
					</div>

					<div class="mt-4 text-center">
						<div class="text-sm text-slate-200">Total Value</div>
						<div class="text-xl font-black text-white">
							{totalValue === null ? '-' : totalValue.toFixed(2)}
						</div>
					</div>
				</div>

				{#if taken.length > 0}
					<div class="mt-6">
						<div class="text-center text-xs font-semibold tracking-wider text-white/70 uppercase">
							Taken
						</div>
						<div class="mt-3 grid gap-3 sm:grid-cols-2">
							{#each taken as t}
								<div class="rounded-2xl border border-emerald-400/30 bg-emerald-600/15 p-4">
									<div class="flex items-center justify-between">
										<div class="font-bold text-white">{t.name}</div>
										<div class="text-sm font-semibold text-emerald-200">
											{(t.fraction * 100).toFixed(0)}%
										</div>
									</div>
									<div class="mt-2 text-sm text-slate-200">Weight: {t.weight.toFixed(2)}</div>
									<div class="text-sm text-slate-200">Value: {t.value.toFixed(2)}</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<CodePanel {meta} {java} />
	</div>
</PixelFrameSimple>
