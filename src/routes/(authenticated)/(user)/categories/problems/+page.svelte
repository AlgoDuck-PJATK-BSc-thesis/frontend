<script lang="ts">
	import type { StandardResponseDto } from '$lib/api/apiCall';
	import { goto } from '$app/navigation';
	import SearchIconSvg from '$lib/svg/EditorComponentIcons/SearchIconSvg.svelte';
	import { Trie } from '../../../(admin)/problem/Trie';
	import type { KeyValuePair } from '$lib/Components/GenericComponents/dropDownMenu/DropDownSelectOptions';
	import { Difficulties, type Difficulty, type ProblemDisplayDto } from './solve/types';

	let { data }: { data: Promise<StandardResponseDto<ProblemDisplayDto[]>> } = $props();

	let colors: Record<string, string> = {
		EASY: 'bg-green-200/20 border-green-500',
		MEDIUM: 'bg-amber-200/20 border-amber-500',
		HARD: 'bg-red-200/20 border-red-500'
	};

	let difficultyFilters: Difficulty[] = $state(Difficulties.map(d => d as Difficulty));
	let searchQuery: string = $state('');

	const buildSearchIndex = (problems: ProblemDisplayDto[]): Trie<Set<string>> => {
		const termToProblems = new Map<string, Set<string>>();

		problems.forEach((problem) => {
			const terms: string[] = [
				...problem.title.toLowerCase().split(/\s+/),
				...problem.tags.map((t) => t.name.toLowerCase()),
				problem.title.toLowerCase(),
				problem.difficulty.name.toLowerCase()
			];

			terms.forEach((t) => {
				if (!termToProblems.has(t)) {
					termToProblems.set(t, new Set());
				}
				termToProblems.get(t)!.add(problem.problemId);
			});
		});

		const entries: KeyValuePair<string, Set<string>>[] = Array.from(termToProblems.entries()).map(
			([key, val]) => ({ key: key, value: val }) as KeyValuePair<string, Set<string>>
		);
		return new Trie(entries);
	};

	const searchProblems = (query: string, searchIndex: Trie<Set<string>>): Set<string> | null => {
		const trimmed = query.trim().toLowerCase();
		if (!trimmed) return null;

		const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
		if (words.length === 0) return null;

		const wordMatchSets: Set<string>[] = words.map(
			(w) => new Set(searchIndex.getAllSubtreeValues(w).flatMap((s) => [...s]))
		);

		return wordMatchSets.reduce((acc, set) => new Set([...acc].filter((id) => set.has(id))));
	};

	const filterProblems = (
		allProblems: ProblemDisplayDto[],
		searchIndex: Trie<Set<string>>
	): ProblemDisplayDto[] => {
		const searchResults = searchProblems(searchQuery, searchIndex);

		return allProblems.filter((p) => {
			if (!difficultyFilters.some((d) => p.difficulty.name === d)) return false;
			if (searchResults === null) return true;
			return searchResults.has(p.problemId);
		});
	};

	const setDifficultyFilter = (difficulties: Difficulty[]) => {
		difficultyFilters = difficulties;
	};
</script>

<svelte:head>
	<title>Problems – Beetcode</title>
</svelte:head>

<main class="min-h-screen w-full overflow-x-hidden bg-ide-bg font-sans text-ide-text-secondary">
	<div
		class="mx-auto flex w-full max-w-[450px] flex-col gap-6 bg-ide-dcard p-6 lg:max-w-[900px] xl:max-w-[1200px]"
	>
		<div class="mb-2 flex flex-col gap-4 py-2 lg:flex-row border-b-1 border-b-ide-text-secondary/25 lg:justify-between">
			<h2 class="py-2 text-3xl font-semibold tracking-tight text-ide-text-primary">Problems</h2>
			<div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
				<div
					class="flex h-full min-w-0 flex-row items-center gap-2 rounded-md border border-ide-accent/20 bg-ide-card px-2 py-1 transition-colors focus-within:border-ide-accent/50"
				>
					<SearchIconSvg options={{ class: 'w-7 h-7 stroke-[2] stroke-[#cccccc] flex-shrink-0' }} />
					<input
						bind:value={searchQuery}
						class="h-full w-full min-w-0 border-0 outline-none bg-transparent focus:border-0 focus:ring-0 focus:outline-none"
						placeholder="search problems..."
					/>
				</div>
				<div class="flex flex-row flex-wrap gap-2 py-2">
					<button
						onclick={() => setDifficultyFilter(['EASY', 'MEDIUM', 'HARD'])}
						class="rounded-full px-5 py-1 transition-colors {difficultyFilters.length === 3
							? 'bg-ide-bg'
							: 'bg-ide-card hover:bg-ide-bg/20'}"
					>
						All
					</button>

          {#each Difficulties as difficulty}
            <button
              onclick={() => setDifficultyFilter([difficulty])}
              class="rounded-full px-5 py-1 transition-colors {difficultyFilters.length === 1 &&
              difficultyFilters[0] === difficulty
                ? 'bg-ide-bg'
                : 'bg-ide-card hover:bg-ide-bg/20'}"
            >
              {`${difficulty.at(0)}${difficulty.toLowerCase().substring(1)}`}
            </button>
          {/each}
				</div>
			</div>
		</div>

		{#await data}
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{#each Array(6) as _}
					<div
						class="flex border-ide-accent/10 border-1 w-full flex-col items-start justify-center gap-2 rounded-xl bg-ide-card px-6 py-7 pb-10 animate-pulse"
					>
						<div class="h-6 w-16 rounded-full bg-ide-bg/50"></div>
						<div class="h-7 w-3/4 rounded bg-ide-bg/50"></div>
						<div class="h-4 w-full rounded bg-ide-bg/30"></div>
						<div class="h-4 w-2/3 rounded bg-ide-bg/30"></div>
						<div class="mt-2 flex gap-1">
							<div class="h-5 w-12 rounded-full bg-ide-bg/30"></div>
							<div class="h-5 w-16 rounded-full bg-ide-bg/30"></div>
						</div>
					</div>
				{/each}
			</div>
		{:then resolvedData}
			{@const allProblems = resolvedData.body}
			{@const searchIndex = buildSearchIndex(allProblems)}
			{@const problems = filterProblems(allProblems, searchIndex)}
			
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{#each problems as problem}
					<button
						onclick={() => goto(`problems/solve/?problem=${problem.problemId}`)}
						class="flex border-ide-accent/10 border-1 w-full flex-col items-start justify-center gap-2 rounded-xl bg-ide-card px-6 py-7 pb-10 transition-colors hover:cursor-pointer hover:bg-ide-card/50"
					>
						<div
							class="rounded-full border px-3 py-1 text-sm font-semibold {colors[
								problem.difficulty.name
							]}"
						>
							<span>{problem.difficulty.name.toLowerCase()}</span>
						</div>
						<h3 class="text-xl font-semibold text-ide-text-primary">{problem.title}</h3>
						<p class="line-clamp-2 overflow-hidden text-start text-ide-text-secondary">
							Lorem ipsum dolor sit amet consectetur adipisicing elit.
						</p>
						{#if problem.tags.length > 0}
							<div class="mt-2 flex flex-wrap gap-1">
								{#each problem.tags as tag}
									<span class="rounded-full bg-[#3c3c3c] px-2 py-0.5 text-xs text-gray-300"
										>{tag.name}</span
									>
								{/each}
							</div>
						{/if}
					</button>
				{:else}
					<div class="text-center py-12 text-gray-400">
						<p>No problems found matching your search.</p>
					</div>
				{/each}
			</div>
		{:catch error}
			<div class="text-center py-12 text-red-400">
				<p>Failed to load problems. Please try again.</p>
				<p class="text-sm mt-2">{error.message}</p>
			</div>
		{/await}
	</div>
</main>