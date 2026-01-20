<script lang="ts">
	import Icons from '../../_components/Icons.svelte';
	import CodePanel from '../../_components/CodePanel.svelte';
	import { meta, java } from '../snippets/bst.java';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';

	type BstNode = { value: number; left: BstNode | null; right: BstNode | null };
	type PositionedNode = { x: number; y: number; value: number; key: string };
	type Edge = { fromX: number; fromY: number; toX: number; toY: number; key: string };

	function initialTree(): BstNode {
		return {
			value: 50,
			left: {
				value: 30,
				left: { value: 20, left: null, right: null },
				right: { value: 40, left: null, right: null }
			},
			right: {
				value: 70,
				left: { value: 60, left: null, right: null },
				right: { value: 80, left: null, right: null }
			}
		};
	}

	let tree = $state<BstNode>(initialTree());
	let input = $state('');

	function insert(node: BstNode | null, value: number): BstNode {
		if (!node) return { value, left: null, right: null };
		if (value < node.value) return { ...node, left: insert(node.left, value) };
		if (value > node.value) return { ...node, right: insert(node.right, value) };
		return node;
	}

	function computeLayout(root: BstNode | null) {
		const nodes: PositionedNode[] = [];
		const edges: Edge[] = [];

		const walk = (
			node: BstNode | null,
			x: number,
			y: number,
			level: number,
			spread: number,
			parent?: { x: number; y: number; value: number }
		) => {
			if (!node) return;

			nodes.push({ x, y, value: node.value, key: String(node.value) });

			if (parent) {
				const fromX = parent.x;
				const fromY = parent.y + 18;
				const toX = x;
				const toY = y - 18;
				edges.push({ fromX, fromY, toX, toY, key: `${parent.value}->${node.value}` });
			}

			const childY = y + 80;
			const delta = spread / (level + 1);
			walk(node.left, x - delta, childY, level + 1, spread, { x, y, value: node.value });
			walk(node.right, x + delta, childY, level + 1, spread, { x, y, value: node.value });
		};

		walk(root, 460, 60, 0, 280);
		return { nodes, edges };
	}

	const layoutData = $derived.by(() => computeLayout(tree));

	function doInsert() {
		const v = parseInt(input, 10);
		if (!Number.isNaN(v)) tree = insert(tree, v);
		input = '';
	}

	function reset() {
		tree = initialTree();
		input = '';
	}
</script>

<PixelFrameSimple
	className="w-full px-2 pr-8 py-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
>
	<div class="rounded-[18px] p-2 md:p-3">
		<div class="grid gap-6 md:grid-cols-2">
			<div class="rounded-3xl p-6">
				<div class="text-xl font-black tracking-wide text-white">Binary Search Tree</div>
				<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)]">
					Values smaller go left, larger go right.
				</p>

				<div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
					<div class="overflow-x-auto">
						<svg
							viewBox="0 0 920 520"
							class="mx-auto h-[22rem] w-full min-w-[42rem]"
							preserveAspectRatio="xMidYMin meet"
						>
							{#each layoutData.edges as e (e.key)}
								<line
									x1={e.fromX}
									y1={e.fromY}
									x2={e.toX}
									y2={e.toY}
									stroke="currentColor"
									stroke-opacity="0.35"
									stroke-width="2"
								/>
							{/each}

							{#each layoutData.nodes as n (n.key)}
								<g>
									<circle
										cx={n.x}
										cy={n.y}
										r="26"
										fill="rgba(139,92,246,0.7)"
										stroke="rgba(255,255,255,0.15)"
										stroke-width="2"
									/>
									<text
										x={n.x}
										y={n.y + 6}
										text-anchor="middle"
										fill="white"
										font-size="16"
										font-weight="800"
									>
										{n.value}
									</text>
								</g>
							{/each}
						</svg>
					</div>

					<div class="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
						<div class="space-y-1">
							<label
								class="text-xs font-semibold tracking-wider text-white/70 uppercase"
								for="bstValue"
							>
								Value
							</label>
							<input
								id="bstValue"
								type="number"
								bind:value={input}
								class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white"
								placeholder="e.g. 65"
							/>
						</div>

						<button
							type="button"
							onclick={doInsert}
							class="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2 font-semibold text-white"
						>
							<Icons name="plus" />
							<span>Insert</span>
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
	</div>
</PixelFrameSimple>
