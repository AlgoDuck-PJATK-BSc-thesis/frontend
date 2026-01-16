<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
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
	let checkingSlot = $state<number | null>(null);
	let placedSlot = $state<number | null>(null);
	let totalProfit = $state<number | null>(null);
	let running = $state(false);
	let message = $state(
		'Sort by profit, then try to place each job into the latest free slot before its deadline.'
	);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function maxDeadlineFrom(list: Job[]) {
		return Math.max(1, ...list.map((j) => j.deadline));
	}

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		jobs = [...initial];
		slots = [];
		selectedIds = [];
		consideringId = null;
		checkingSlot = null;
		placedSlot = null;
		totalProfit = null;
		running = false;
		message =
			'Sort by profit, then try to place each job into the latest free slot before its deadline.';
	}

	type Step = {
		considering: number | null;
		checkingSlot: number | null;
		placedSlot: number | null;
		slots: Array<number | null>;
		selected: number[];
		profit: number;
		msg: string;
	};

	function applyStep(s: Step) {
		consideringId = s.considering;
		checkingSlot = s.checkingSlot;
		placedSlot = s.placedSlot;
		slots = s.slots;
		selectedIds = s.selected;
		totalProfit = s.profit;
		message = s.msg;
	}

	function run() {
		if (running) return;

		const sorted = [...jobs].sort((a, b) => b.profit - a.profit);
		const maxD = maxDeadlineFrom(sorted);

		const steps: Step[] = [];

		const localSlots: Array<number | null> = Array(maxD).fill(null);
		const localSelected: number[] = [];
		let profit = 0;

		steps.push({
			considering: null,
			checkingSlot: null,
			placedSlot: null,
			slots: [...localSlots],
			selected: [...localSelected],
			profit,
			msg: `Sorted by profit. There are ${maxD} slot(s): t1..t${maxD}.`
		});

		for (const job of sorted) {
			steps.push({
				considering: job.id,
				checkingSlot: null,
				placedSlot: null,
				slots: [...localSlots],
				selected: [...localSelected],
				profit,
				msg: `Consider Job ${job.id} (profit ${job.profit}, deadline t${job.deadline}). Try latest slot first.`
			});

			let placed = false;

			for (let t = job.deadline - 1; t >= 0; t--) {
				const occ = localSlots[t];

				steps.push({
					considering: job.id,
					checkingSlot: t,
					placedSlot: null,
					slots: [...localSlots],
					selected: [...localSelected],
					profit,
					msg:
						occ === null
							? `Check slot t${t + 1}: free.`
							: `Check slot t${t + 1}: occupied by J${occ}.`
				});

				if (occ === null) {
					localSlots[t] = job.id;
					localSelected.push(job.id);
					profit += job.profit;

					steps.push({
						considering: job.id,
						checkingSlot: t,
						placedSlot: t,
						slots: [...localSlots],
						selected: [...localSelected],
						profit,
						msg: `Place Job ${job.id} into slot t${t + 1}. Total profit = ${profit}.`
					});

					placed = true;
					break;
				}
			}

			if (!placed) {
				steps.push({
					considering: job.id,
					checkingSlot: null,
					placedSlot: null,
					slots: [...localSlots],
					selected: [...localSelected],
					profit,
					msg: `No free slot at or before t${job.deadline}. Skip Job ${job.id}.`
				});
			}
		}

		steps.push({
			considering: null,
			checkingSlot: null,
			placedSlot: null,
			slots: [...localSlots],
			selected: [...localSelected],
			profit,
			msg: `Done. Scheduled ${localSelected.length} job(s). Total profit = ${profit}.`
		});

		reset();
		running = true;

		applyStep(steps[0]);

		let idx = 1;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				applyStep(steps[idx]);
				idx += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 650);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	function isSelected(id: number) {
		return selectedIds.includes(id);
	}

	function slotClass(idx: number, v: number | null) {
		if (placedSlot === idx) return 'border-green-400 bg-green-600/25';
		if (checkingSlot === idx) return 'border-yellow-300 bg-yellow-500/15';
		if (v !== null) return 'border-white/10 bg-white/5';
		return 'border-white/10 bg-slate-900/40';
	}

	function jobsForView() {
		return [...jobs].sort((a, b) => b.profit - a.profit);
	}

	function slotsForView() {
		if (slots.length > 0) return slots;
		return Array(maxDeadlineFrom(jobs)).fill(null) as Array<number | null>;
	}
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-8 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-lg font-bold text-white">Job Sequencing</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Maximize profit by scheduling jobs before their deadlines, one per time slot. Greedy order:
				highest profit first.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="text-center text-sm text-[color:var(--color-landingpage-subtitle)]">
					{message}
				</div>

				<div class="mt-5 space-y-3">
					{#each jobsForView() as job}
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
						{#each slotsForView() as s, idx}
							<div class={['w-20 rounded-xl border p-3 text-center', slotClass(idx, s)].join(' ')}>
								<div class="text-xs text-slate-300">t{idx + 1}</div>
								<div class="mt-1 font-bold text-white">{s === null ? '-' : `J${s}`}</div>
							</div>
						{/each}
					</div>

					<div class="mt-4 text-center">
						<div class="text-sm text-slate-200">Total Profit</div>
						<div class="text-xl font-black text-white">
							{totalProfit === null ? '-' : totalProfit}
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

				{#if selectedIds.length > 0}
					<div class="mt-5 text-center font-semibold text-white">
						Scheduled Jobs: {selectedIds.join(', ')}
					</div>
				{/if}
			</div>
		</div>

		<CodePanel {meta} {java} />
	</div>
</PixelFrameSimple>
