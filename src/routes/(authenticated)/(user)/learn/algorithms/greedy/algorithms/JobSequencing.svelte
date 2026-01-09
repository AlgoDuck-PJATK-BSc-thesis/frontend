<script lang="ts">
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/job-sequencing.java';

	type Job = { id: number; deadline: number; profit: number };

	const initial: Job[] = [
		{ id: 1, deadline: 2, profit: 100 },
		{ id: 2, deadline: 1, profit: 19 },
		{ id: 3, deadline: 2, profit: 27 },
		{ id: 4, deadline: 1, profit: 25 },
		{ id: 5, deadline: 3, profit: 15 }
	];

	let jobs = $state<Job[]>([...initial]);
	let slots = $state<Array<number | null>>([]);
	let selectedIds = $state<number[]>([]);
	let consideringId = $state<number | null>(null);
	let totalProfit = $state<number | null>(null);
	let running = $state(false);
	let message = $state(
		'Sort by profit, then schedule each job as late as possible before its deadline.'
	);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		jobs = [...initial];
		slots = [];
		selectedIds = [];
		consideringId = null;
		totalProfit = null;
		running = false;
		message = 'Sort by profit, then schedule each job as late as possible before its deadline.';
	}

	function run() {
		if (running) return;

		const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
		const maxDeadline = Math.max(...sorted.map((j) => j.deadline));

		type Step = {
			considering: number | null;
			slots: Array<number | null>;
			selected: number[];
			profit: number;
			msg: string;
		};

		const steps: Step[] = [];

		let localSlots: Array<number | null> = Array(maxDeadline).fill(null);
		let localSelected: number[] = [];
		let profit = 0;

		steps.push({
			considering: null,
			slots: [...localSlots],
			selected: [...localSelected],
			profit,
			msg: `Slots: ${maxDeadline} time units`
		});

		for (const job of sorted) {
			steps.push({
				considering: job.id,
				slots: [...localSlots],
				selected: [...localSelected],
				profit,
				msg: `Consider Job ${job.id} (d=${job.deadline}, p=${job.profit})`
			});

			let placed = false;
			for (let t = job.deadline - 1; t >= 0; t--) {
				if (localSlots[t] === null) {
					localSlots = localSlots.map((x, idx) => (idx === t ? job.id : x));
					localSelected = [...localSelected, job.id];
					profit += job.profit;
					placed = true;

					steps.push({
						considering: job.id,
						slots: [...localSlots],
						selected: [...localSelected],
						profit,
						msg: `Schedule Job ${job.id} at slot ${t + 1}`
					});
					break;
				}
			}

			if (!placed) {
				steps.push({
					considering: job.id,
					slots: [...localSlots],
					selected: [...localSelected],
					profit,
					msg: `Skip Job ${job.id} (no slot available)`
				});
			}
		}

		steps.push({
			considering: null,
			slots: [...localSlots],
			selected: [...localSelected],
			profit,
			msg: `Done: scheduled ${localSelected.length} jobs`
		});

		reset();
		running = true;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				consideringId = steps[idx].considering;
				slots = steps[idx].slots;
				selectedIds = steps[idx].selected;
				totalProfit = steps[idx].profit;
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

	function isSelected(id: number) {
		return selectedIds.includes(id);
	}
</script>

<div class="grid gap-6 md:grid-cols-2">
	<div class="rounded-3xl border border-white/10 bg-white/5 p-6">
		<div class="text-lg font-bold text-white">Job Sequencing</div>
		<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
			Maximize profit by scheduling jobs before their deadlines, one per time slot.
		</div>

		<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
			<div class="text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
				{message}
			</div>

			<div class="mt-5 space-y-3">
				{#each [...jobs].sort((a, b) => b.profit - a.profit) as job}
					<div
						class={[
							'rounded-2xl border-2 p-4 transition',
							isSelected(job.id)
								? 'border-green-400 bg-green-600/25'
								: consideringId === job.id
									? 'border-yellow-300 bg-yellow-500/15'
									: 'border-white/10 bg-white/5'
						].join(' ')}
					>
						<div class="flex items-center justify-between">
							<div class="font-semibold text-white">Job {job.id}</div>
							<div class="flex gap-4 text-sm">
								<span class="text-slate-200">Deadline: {job.deadline}</span>
								<span class="text-slate-200">Profit: {job.profit}</span>
							</div>
							{#if isSelected(job.id)}
								<span class="font-bold text-green-300">Scheduled</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
				<div class="text-center text-xs font-semibold tracking-wider text-white/70 uppercase">
					Slots
				</div>
				<div class="mt-3 flex flex-wrap justify-center gap-2">
					{#each slots.length > 0 ? slots : Array(Math.max(...jobs.map((j) => j.deadline))).fill(null) as s, idx}
						<div class="w-20 rounded-xl border border-white/10 bg-slate-900/40 p-3 text-center">
							<div class="text-xs text-slate-300">t{idx + 1}</div>
							<div class="mt-1 font-bold text-white">{s === null ? '—' : `J${s}`}</div>
						</div>
					{/each}
				</div>

				<div class="mt-4 text-center">
					<div class="text-sm text-slate-200">Total Profit</div>
					<div class="text-xl font-black text-white">
						{totalProfit === null ? '—' : totalProfit}
					</div>
				</div>
			</div>

			<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
				<button
					type="button"
					onclick={run}
					disabled={running}
					class="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
		</div>
	</div>

	<CodePanel {meta} {java} />
</div>
