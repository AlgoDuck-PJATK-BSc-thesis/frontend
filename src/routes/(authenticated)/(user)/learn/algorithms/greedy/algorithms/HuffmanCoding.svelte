<script lang="ts">
	import PixelFrameSimple from './../../../../../../../lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { onDestroy } from 'svelte';
	import Icons from '../../../_components/Icons.svelte';
	import CodePanel from '../../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/huffman.java';

	type Leaf = { ch: string; freq: number };

	const input: Leaf[] = [
		{ ch: 'a', freq: 5 },
		{ ch: 'b', freq: 9 },
		{ ch: 'c', freq: 12 },
		{ ch: 'd', freq: 13 },
		{ ch: 'e', freq: 16 },
		{ ch: 'f', freq: 45 }
	];

	type Node = {
		id: string;
		freq: number;
		ch?: string;
		left?: Node;
		right?: Node;
	};

	type PoolItem = { id: string; label: string; freq: number };

	type Step = {
		pool: PoolItem[];
		pickA?: string;
		pickB?: string;
		result?: PoolItem;
		done: boolean;
	};

	let poolView = $state<PoolItem[]>([]);
	let pickA = $state<string | null>(null);
	let pickB = $state<string | null>(null);
	let result = $state<PoolItem | null>(null);
	let codes = $state<Record<string, string>>({});
	let running = $state(false);

	let intervalId: ReturnType<typeof setInterval> | null = null;

	function reset() {
		if (intervalId) clearInterval(intervalId);
		intervalId = null;
		poolView = [];
		pickA = null;
		pickB = null;
		result = null;
		codes = {};
		running = false;
	}

	function build() {
		let idCounter = 0;

		const leaves: Node[] = input.map((x) => ({
			id: `n${idCounter++}`,
			freq: x.freq,
			ch: x.ch
		}));

		const steps: Step[] = [];

		function snapshot(nodes: Node[]): PoolItem[] {
			return nodes
				.map((n) => ({
					id: n.id,
					label: n.ch ? `${n.ch}` : 'Merge',
					freq: n.freq
				}))
				.sort((a, b) => a.freq - b.freq);
		}

		let pq = [...leaves];

		steps.push({ pool: snapshot(pq), done: false });

		while (pq.length > 1) {
			pq.sort((a, b) => a.freq - b.freq);
			const a = pq.shift()!;
			const b = pq.shift()!;

			const parent: Node = {
				id: `n${idCounter++}`,
				freq: a.freq + b.freq,
				left: a,
				right: b
			};

			pq = [...pq, parent];

			const poolSnap = snapshot(pq);
			steps.push({
				pool: poolSnap,
				pickA: a.id,
				pickB: b.id,
				result: { id: parent.id, label: 'Merge', freq: parent.freq },
				done: false
			});
		}

		const root = pq[0];

		const out: Record<string, string> = {};
		function walk(n: Node, prefix: string) {
			if (n.ch) {
				out[n.ch] = prefix.length === 0 ? '0' : prefix;
				return;
			}
			if (n.left) walk(n.left, prefix + '0');
			if (n.right) walk(n.right, prefix + '1');
		}
		walk(root, '');

		steps.push({ pool: snapshot([root]), done: true });

		return { steps, out };
	}

	function run() {
		if (running) return;

		const { steps, out } = build();

		reset();
		running = true;

		let idx = 0;
		intervalId = setInterval(() => {
			if (idx < steps.length) {
				const s = steps[idx];
				poolView = s.pool;
				pickA = s.pickA ?? null;
				pickB = s.pickB ?? null;
				result = s.result ?? null;

				if (s.done) {
					codes = out;
				}

				idx += 1;
			} else {
				running = false;
				if (intervalId) clearInterval(intervalId);
				intervalId = null;
			}
		}, 900);
	}

	onDestroy(() => {
		if (intervalId) clearInterval(intervalId);
	});

	function chipClass(id: string) {
		if (id === pickA || id === pickB) return 'border-yellow-300 bg-yellow-500/10';
		if (result && id === result.id) return 'border-emerald-300 bg-emerald-500/10';
		return 'border-white/10 bg-white/5';
	}
</script>

<PixelFrameSimple
	className="w-full px-4 pr-8 py-8 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="rounded-3xl p-6">
			<div class="text-lg font-bold text-white">Huffman Coding</div>
			<div class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
				Build an optimal prefix-free code by repeatedly combining the two lowest-frequency nodes.
			</div>

			<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
				<div class="flex flex-wrap items-center justify-center gap-3">
					<button
						type="button"
						onclick={run}
						disabled={running}
						class="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white disabled:bg-gray-600"
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
						Priority Queue
					</div>

					<div class="mt-2 text-center text-xs text-slate-300">
						"Merge X" means an internal (combined) node with total frequency X. The number X is the
						sum of its two children's frequencies (the two nodes that were merged).
					</div>

					<div class="mt-3 flex flex-wrap justify-center gap-2">
						{#each poolView.length > 0 ? poolView : input
									.map((x, i) => ({ id: `seed${i}`, label: x.ch, freq: x.freq }))
									.sort((a, b) => a.freq - b.freq) as p}
							<div
								class={['rounded-xl border px-3 py-2 text-sm text-slate-200', chipClass(p.id)].join(
									' '
								)}
							>
								<span class="font-semibold text-white">{p.label}</span>
								<span class="ml-2 text-slate-300">{p.freq}</span>
							</div>
						{/each}
					</div>

					{#if pickA && pickB}
						<div class="mt-5 text-center text-sm text-slate-200">Combine two smallest nodes</div>
					{/if}

					{#if Object.keys(codes).length > 0}
						<div class="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
							<div class="text-center text-xs font-semibold tracking-wider text-white/70 uppercase">
								Codes
							</div>
							<div class="mt-3 grid gap-2 sm:grid-cols-2">
								{#each Object.entries(codes).sort((a, b) => a[0].localeCompare(b[0])) as [ch, code]}
									<div class="rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2">
										<div class="flex items-center justify-between">
											<div class="font-semibold text-white">{ch}</div>
											<div class="text-sm text-purple-200">{code}</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<CodePanel {meta} {java} />
	</div>
</PixelFrameSimple>
