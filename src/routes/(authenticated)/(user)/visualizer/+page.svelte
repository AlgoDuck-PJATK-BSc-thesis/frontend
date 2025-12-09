<script lang="ts">
	import LinearStructuresVisualizer from './LinearStructuresVisualizer.svelte';
	import HierarchicalStructuresVisualizer from './HierarchicalStructuresVisualizer.svelte';
</script>

<div class="min-h-screen px-4 py-10 md:px-8">
	<div class="mx-auto max-w-6xl space-y-10">
		<section class="space-y-8 rounded-3xl px-6 py-8 md:px-10 md:py-10">
			<header class="space-y-3">
				<h1
					class="ocr-outline ocr-title isolate mt-0 mb-6 ml-0 px-1 text-center [font-family:var(--font-ariw9500)] font-black tracking-widest text-[var(--color-landingpage-title)] md:text-5xl"
				>
					Data Structures Visualizer
				</h1>

				<p class="mx-auto max-w-3xl text-lg text-[color:var(--color-landingpage-subtitle)]">
					Stuck on a problem? Check out interactive visualizations of fundamental linear and
					non-linear data structures with matching Java implementations.
				</p>
			</header>

			<div class="flex justify-center">
				<div
					class="w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-8 text-sm text-slate-100 md:px-8 md:py-9"
				>
					<div class="flex flex-col gap-8 md:flex-row">
						<div class="flex-1 space-y-3">
							<h2 class="text-base font-semibold text-[var(--color-landingpage-subtitle)]">
								Linear Data Structures
							</h2>
							<ul class="space-y-1.5">
								<li>
									<a href="#stack" class="block rounded py-1.5 pl-2 transition hover:bg-slate-800">
										<span class="font-medium text-blue-400"> Stack (LIFO) </span>
										<span class="block text-xs text-blue-400/80"> Push/Pop operations </span>

										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#stack-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
								<li class="mt-1">
									<a href="#queue" class="block rounded py-1.5 pl-2 transition hover:bg-slate-800">
										<span class="font-medium text-green-400">Queue (FIFO)</span>
										<span class="block text-xs text-green-400/80">Enqueue/Dequeue operations</span>
										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#queue-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
								<li class="mt-1">
									<a
										href="#linked-list"
										class="block rounded py-1.5 pl-2 transition hover:bg-slate-800"
									>
										<span class="font-medium text-purple-400">Linked List</span>
										<span class="block text-xs text-purple-400/80">Append/Remove operations</span>
										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#linked-list-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
								<li class="mt-1">
									<a
										href="#dynamic-array"
										class="block rounded py-1.5 pl-2 transition hover:bg-slate-800"
									>
										<span class="font-medium text-orange-400">Dynamic Array</span>
										<span class="block text-xs text-orange-400/80">Add/Remove with indexing</span>
										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#dynamic-array-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
							</ul>
						</div>

						<div
							class="flex-1 space-y-3 border-t border-slate-700 pt-6 md:border-t-0 md:border-l md:border-slate-700 md:pt-0 md:pl-6"
						>
							<h2 class="text-base font-semibold text-[var(--color-landingpage-subtitle)]">
								Hierarchical & Non-Linear Data Structures
							</h2>
							<ul class="space-y-1.5">
								<li>
									<a href="#bst" class="block rounded py-1.5 pl-2 transition hover:bg-slate-800">
										<span class="font-medium text-purple-400">Binary Search Tree</span>
										<span class="block text-xs text-purple-400/80"
											>Visual tree with nodes and connections</span
										>
										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#bst-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
								<li class="mt-1">
									<a href="#heap" class="block rounded py-1.5 pl-2 transition hover:bg-slate-800">
										<span class="font-medium text-orange-400">Min Heap</span>
										<span class="block text-xs text-orange-400/80"
											>Array-based heap with tree visualization</span
										>
										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#heap-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
								<li class="mt-1">
									<a href="#graph" class="block rounded py-1.5 pl-2 transition hover:bg-slate-800">
										<span class="font-medium text-cyan-400">Graph</span>
										<span class="block text-xs text-cyan-400/80"
											>Undirected graph with vertices and edges</span
										>
										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#graph-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
								<li class="mt-1">
									<a href="#trie" class="block rounded py-1.5 pl-2 transition hover:bg-slate-800">
										<span class="font-medium text-pink-400">Trie</span>
										<span class="block text-xs text-pink-400/80">Prefix tree for word storage</span>
										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#trie-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
								<li class="mt-1">
									<a
										href="#hash-table"
										class="block rounded py-1.5 pl-2 transition hover:bg-slate-800"
									>
										<span class="font-medium text-emerald-400">Hash Table</span>
										<span class="block text-xs text-emerald-400/80"
											>Key-value storage with hashing</span
										>
										<span
											class="block pl-4 text-xs text-[color:var(--color-landingpage-subtitle)]/80"
											><br /> Visualisation</span
										>
									</a>
								</li>
								<li>
									<a
										href="#hash-table-java"
										class="block rounded py-1.5 pl-6 text-xs text-[color:var(--color-landingpage-subtitle)]/80 transition hover:bg-slate-800"
									>
										Java Implementation
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>

		<main class="space-y-12">
			<LinearStructuresVisualizer />
			<HierarchicalStructuresVisualizer />
		</main>
	</div>
</div>
