<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/activity-selection.java';

	type Activity = { id: number; start: number; end: number };

	const initial: Activity[] = [
		{ id: 1, start: 1, end: 3 },
		{ id: 2, start: 2, end: 5 },
		{ id: 3, start: 4, end: 7 },
		{ id: 4, start: 1, end: 8 },
		{ id: 5, start: 5, end: 9 },
		{ id: 6, start: 8, end: 10 }
	];

	let activities = $state<Activity[]>([...initial]);
	let selectedIds = $state<number[]>([]);
	let consideringId = $state<number | null>(null);
	let running = $state(false);
	let message = $state<string>('Sort by end time, then pick the next compatible activity.');

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		activities = [...initial];
		selectedIds = [];
		consideringId = null;
		running = false;
		message = 'Sort by end time, then pick the next compatible activity.';
	}

	function run() {
		if (running) return;

		const sorted = [...activities].sort((a, b) => a.end - b.end);

		type Step = {
			selected: number[];
			considering: number | null;
			msg: string;
		};

		const steps: Step[] = [];

		let selected: Activity[] = [];
		let lastEnd = -Infinity;

		for (let i = 0; i < sorted.length; i++) {
			const a = sorted[i];
			const canTake = a.start >= lastEnd;

			steps.push({
				selected: selected.map((x) => x.id),
				considering: a.id,
				msg: `Consider Activity ${a.id} [${a.start}, ${a.end}]`
			});

			if (canTake) {
				selected = [...selected, a];
				lastEnd = a.end;

				steps.push({
					selected: selected.map((x) => x.id),
					considering: a.id,
					msg: `Select Activity ${a.id} (latest end = ${lastEnd})`
				});
			} else {
				steps.push({
					selected: selected.map((x) => x.id),
					considering: a.id,
					msg: `Skip Activity ${a.id} (overlaps with end = ${lastEnd})`
				});
			}
		}

		steps.push({
			selected: selected.map((x) => x.id),
			considering: null,
			msg: `Done: selected ${selected.length} activities`
		});

		reset();
		running = true;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				selectedIds = steps[idx].selected;
				consideringId = steps[idx].considering;
				message = steps[idx].msg;
				idx += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 700);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	function maxTime() {
		return Math.max(...activities.map((a) => a.end));
	}

	function isSelected(id: number) {
		return selectedIds.includes(id);
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Activity Selection</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Pick the maximum number of non-overlapping activities by always taking the activity with the
			earliest finishing time next.
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
				{message}
			</div>

			<div class="mt-5 space-y-3">
				{#each [...activities].sort((a, b) => a.end - b.end) as a}
					<div
						class={[
							'rounded-2xl border-2 p-4 transition',
							isSelected(a.id)
								? 'border-green-400 bg-green-600/25'
								: consideringId === a.id
									? 'border-yellow-300 bg-yellow-500/15'
									: 'border-white/10 bg-white/5'
						].join(' ')}
					>
						<div class="flex items-center justify-between">
							<div class="font-semibold text-white">Activity {a.id}</div>
							<div class="flex gap-4 text-sm">
								<span class="text-slate-200">Start: {a.start}</span>
								<span class="text-slate-200">End: {a.end}</span>
							</div>
							{#if isSelected(a.id)}
								<span class="font-bold text-green-300">Selected</span>
							{/if}
						</div>

						<div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">
							class={isSelected(a.id)
								? 'h-full bg-green-500'
								: consideringId === a.id
									? 'h-full bg-yellow-400'
									: 'h-full bg-sky-500'}
							style={`margin-left:${(a.start / maxTime()) * 100}%;width:${((a.end - a.start) / maxTime()) * 100}%`}
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					onclick={run}
					disabled={running}
					class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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

			{#if selectedIds.length > 0}
				<div class="mt-5 text-center font-semibold text-white">
					Selected: {selectedIds.join(', ')}
				</div>
			{/if}
		</div>
	</div>

	<CodePanel {meta} {java} />
</div>
