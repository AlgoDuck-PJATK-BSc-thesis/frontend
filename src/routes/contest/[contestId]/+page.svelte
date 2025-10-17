<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import PixelFrameMini from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameMini.svelte';
	import coin from '$lib/images/headers/Coin.png';
	import duck from '$lib/images/ducks/duck.png';

	type Diff = 'Easy' | 'Medium' | 'Hard';
	type Prob = { id: string; title: string; difficulty: Diff };

	export let data: {
		contest?: {
			id: string;
			name: string;
			startTime?: string;
			endTime?: string;
			problems?: Array<{ id: string | number; title: string; difficulty: string }>;
		};
	};

	const normalizeDiff = (d: string): Diff => {
		const x = (d || '').trim().toLowerCase();
		if (x.startsWith('e')) return 'Easy';
		if (x.startsWith('m')) return 'Medium';
		return 'Hard';
	};

	const nowMs = Date.now();
	const fallbackStartISO = new Date(nowMs - 2 * 24 * 3600e3).toISOString();
	const fallbackEndISO = new Date(nowMs + (12 * 24 * 3600 + 9 * 3600 + 32 * 60 + 7) * 1000).toISOString();

	const fallbackProblems: Prob[] = [
		{ id: 'p1', title: 'Two pointers', difficulty: 'Easy' },
		{ id: 'p2', title: "Kadane's Algorithm", difficulty: 'Medium' },
		{ id: 'p3', title: 'Maximum Product Subarray', difficulty: 'Hard' }
	];

	let contest: { id: string; name: string; startTime: string; endTime: string; problems: Prob[] };
	$: contest = data?.contest
		? {
			id: String(data.contest.id),
			name: data.contest.name,
			startTime: data.contest.startTime || fallbackStartISO,
			endTime: data.contest.endTime || fallbackEndISO,
			problems: (data.contest.problems ?? fallbackProblems).map((p: any) => ({
				id: String(p.id ?? p.problemId ?? p.contestProblemId ?? ''),
				title: String(p.title ?? p.name ?? 'Problem'),
				difficulty: normalizeDiff(p.difficulty ?? 'Easy')
			}))
		}
		: {
			id: 'jan-2025',
			name: 'January Contest',
			startTime: fallbackStartISO,
			endTime: fallbackEndISO,
			problems: fallbackProblems
		};

	const diffs: Diff[] = ['Easy', 'Medium', 'Hard'];
	const usingFallbackTimes = !data?.contest?.endTime;

	$: titleFromQS = $page.url.searchParams.get('title') || '';
	$: contestTitle = titleFromQS || contest.name || 'Contest';

	let problems: Prob[] = [];
	$: problems = contest.problems
		.slice()
		.sort(
			(a, b) =>
				['Easy', 'Medium', 'Hard'].indexOf(a.difficulty) -
				['Easy', 'Medium', 'Hard'].indexOf(b.difficulty)
		);

	function pickProblem(diff: Diff): Prob {
		return (
			problems.find((p) => p.difficulty === diff) ??
			fallbackProblems[['Easy', 'Medium', 'Hard'].indexOf(diff)]
		);
	}

	function formatRange(startISO?: string, endISO?: string) {
		const st = startISO ? new Date(startISO) : null;
		const et = endISO ? new Date(endISO) : null;
		if (!st || !et || Number.isNaN(st.getTime()) || Number.isNaN(et.getTime())) return '';
		const stT = st.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		const stD = st.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
		const etT = et.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		const etD = et.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
		return `${stT} ${stD} – ${etT} ${etD}`;
	}
	$: rangeText = formatRange(contest.startTime, contest.endTime);

	let timeLeft = '00:00:00';
	let timer: ReturnType<typeof setInterval> | null = null;
	function tick() {
		const end = Date.parse(contest.endTime);
		if (Number.isNaN(end)) {
			timeLeft = '00:00:00';
			return;
		}
		const diff = Math.max(0, end - Date.now());
		const s = Math.floor(diff / 1000);
		const d = Math.floor(s / 86400);
		const h = Math.floor((s % 86400) / 3600);
		const m = Math.floor((s % 3600) / 60);
		const sec = s % 60;
		const days = d ? `${d}d ` : '';
		timeLeft = `${days}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
	}

	let localProgress: Record<string, boolean> = {};
	let solved: Record<string, boolean> = {};
	let revealed = false;

	const PROGRESS_KEY = () => `contest-progress-${contest.id}`;
	const RESULTS_KEY = () => `contest-results-${contest.id}`;

	onMount(() => {
		const KEY = 'contest_fallback_endMs';
		if (usingFallbackTimes) {
			let savedEndMs = Number(localStorage.getItem(KEY));
			if (!savedEndMs || Number.isNaN(savedEndMs)) {
				const parsed = Date.parse(contest.endTime);
				savedEndMs = Number.isNaN(parsed) ? Date.now() + 36 * 3600e3 : parsed;
				localStorage.setItem(KEY, String(savedEndMs));
			}
			const alignedEndISO = new Date(savedEndMs).toISOString();
			const alignedStartISO = new Date(savedEndMs - 2 * 24 * 3600e3).toISOString();
			contest = { ...contest, startTime: alignedStartISO, endTime: alignedEndISO };
		}
		tick();
		timer = setInterval(tick, 1000);

		const savedProgress = localStorage.getItem(PROGRESS_KEY());
		if (savedProgress) localProgress = JSON.parse(savedProgress);

		const savedResults = localStorage.getItem(RESULTS_KEY());
		if (savedResults) {
			try {
				const parsed = JSON.parse(savedResults);
				if (parsed && typeof parsed === 'object') {
					solved = parsed;
					revealed = true;
				}
			} catch {}
		}

		return () => timer && clearInterval(timer);
	});

	// TEST: lighting — entering a problem marks local UI-only progress (does NOT mean solved).
	function markEntry(id: string) {
		localProgress = { ...localProgress, [String(id)] : true };
		localStorage.setItem(PROGRESS_KEY(), JSON.stringify(localProgress));
	}

	function idStr(v: any) {
		return String(v ?? '');
	}

	function collectSolved(obj: any): Record<string, boolean> {
		const out: Record<string, boolean> = {};
		if (!obj) return out;

		if (Array.isArray(obj?.solvedProblemIds)) {
			for (const pid of obj.solvedProblemIds) out[idStr(pid)] = true;
		}
		if (Array.isArray(obj)) {
			for (const it of obj) {
				if (typeof it === 'string' || typeof it === 'number') {
					out[idStr(it)] = true;
				}
			}
		}
		return out;
	}

	async function checkResults() {
		revealed = true;
		try {
			const res = await fetch(`/api/Contest/${contest.id}/results`);
			if (!res.ok) return;
			const json = await res.json();
			const map = collectSolved(json);
			if (map && Object.keys(map).length > 0) {
				solved = map;
				localStorage.setItem(RESULTS_KEY(), JSON.stringify(solved));
			}
		} catch {

		}
	}

	const board = [
		{ name: 'JellyJuggernaut', time: '09:32 min' },
		{ name: 'GlowGadget', time: '11:47 min' },
		{ name: 'AquaEcho', time: '12:51 min' },
		{ name: 'EchoOrbit', time: '13:40 min' },
		{ name: 'ZestyZebra', time: '20:21 min' },
		{ name: 'CodeCrafter', time: '33:45 min' },
		{ name: 'CloudCraze', time: '47:18 min' },
		{ name: 'NovaNebula', time: '48:10 min' },
		{ name: 'PixelPenguin', time: '49:00 min' },
		{ name: 'TurboTurtle', time: '50:02 min' },
		{ name: 'CrimsonCoyote', time: '51:13 min' },
		{ name: 'SilentShadow', time: '52:26 min' },
		{ name: 'BlueBird', time: '53:03 min' },
		{ name: 'QuantumQuokka', time: '53:44 min' },
		{ name: 'RubyRaptor', time: '54:21 min' },
		{ name: 'LogicLynx', time: '55:05 min' },
		{ name: 'CobaltComet', time: '55:47 min' },
		{ name: 'MangoMeteor', time: '56:32 min' },
		{ name: 'NeonNarwhal', time: '57:15 min' },
		{ name: 'VectorViper', time: '58:09 min' },
		{ name: 'HyperHeron', time: '59:00 min' },
		{ name: 'CosmicCrab', time: '01:00 h' },
		{ name: 'BinaryBison', time: '01:01 h' },
		{ name: 'ArcticAardvark', time: '01:02 h' },
		{ name: 'FuzzyFalcon', time: '01:03 h' }
	];
</script>

<section class="font-body grid w-full grid-cols-1 gap-6 px-8 pt-8 pb-24 pr-24 text-[color:var(--color-text)] md:grid-cols-2">
	<PixelFrame className="w-full bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] px-6 pt-6 pb-6">
		<h1
			class="mb-2 text-5xl font-black tracking-widest text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
			style="font-family: var(--font-ariw9500);"
		>
			{contestTitle}
		</h1>

		{#if rangeText}
			<p class="mb-4 opacity-80">{rangeText}</p>
		{/if}

		<div class="mb-3 flex items-center gap-3">
			<img src={coin} alt="coin" class="h-10 w-10" />
			<span class="text-sm opacity-80">WITH DUCK SURPRISE</span>
		</div>

		<div class="mb-8 flex justify-center">
			<div on:click={checkResults}>
				<Button
					size="medium"
					label="CHECK RESULTS"
					labelColor="[color:#000]"
					labelFontSize="1rem"
					labelFontFamily="var(--font-ariw9500)"
					labelFontWeight="bold"
				/>
			</div>
		</div>

		<div class="mx-auto grid w-full max-w-[42rem] gap-6">
			{#each diffs as d, i}
				{@const p = pickProblem(d)}
				<div class="w-full">
					<div class="mb-2 flex items-end gap-3">
						<span
							class="text-2xl md:text-3xl font-black tracking-widest text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
							style="font-family: var(--font-ariw9500);"
						>{i + 1}.</span>
						<h3
							class="text-2xl md:text-3xl font-black tracking-widest text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
							style="font-family: var(--font-ariw9500);"
						>
							{d}
						</h3>
					</div>

					<div on:click={() => markEntry(p.id)}>
						<a
							href={`/contest/${contest.id}/problem/${p.id}?title=${encodeURIComponent(p.title)}&difficulty=${encodeURIComponent(p.difficulty)}`}
							class="block no-underline"
						>
							<PixelFrame
								className="w-full px-5 py-3"
								style="
									background:{revealed && solved[String(p.id)] ? 'linear-gradient(180deg,#28e06a 0%,#17b752 100%)' : 'linear-gradient(to bottom,var(--color-accent-3),var(--color-accent-4))'};
									box-shadow:{revealed && solved[String(p.id)] ? '0 0 20px rgba(30,215,96,.45) inset, 0 0 12px rgba(30,215,96,.45)' : 'none'};
									transition: background 120ms ease-in-out, box-shadow 120ms ease-in-out;
								"
							>
								<span
									class="text-lg md:text-xl font-black"
									style="font-family: var(--font-ariw9500); color: {revealed && solved[String(p.id)] ? '#0b2e12' : 'var(--color-accent-2)'};"
								>{p.title}</span>
							</PixelFrame>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</PixelFrame>

	<PixelFrame className="w-full bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] pt-6 pr-2 pb-6">
		<div class="mb-4 flex items-center justify-between px-6">
			<h2
				class="lb-title font-black tracking-widest text-[color:var(--color-primary)] [text-shadow:5.5px_1.5px_0_#000,-2px_-1.5px_0_#000,1.5px_-1.5px_0_#000,-1.5px_2px_0_#000]"
				style="font-family: var(--font-ariw9500);"
			>Leaderboard</h2>
			<PixelFrameMini className="bg-[color:var(--color-bg)] px-3 py-1 text-sm">Time left: {timeLeft}</PixelFrameMini>
		</div>

		<div class="lb-scroll px-2">
			{#each board as r, i}
				<div class="lb-row grid items-center gap-3 px-4 py-2">
					<span class="lb-rank text-right" style="font-family: var(--font-ariw9500);">{i + 1}.</span>
					<div class="lb-avatar h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-[color:var(--color-primary)] shadow">
						<img
							src={duck}
							alt="duck"
							class="h-full w-full -translate-x-[-15%] -translate-y-[-10%] scale-[1.5] object-cover object-[left_top]"
						/>
					</div>
					<span class="lb-name truncate">{r.name}</span>
					<PixelFrameMini className="lb-time px-3 py-0.5 text-[0.95rem]">
						<span class="block w-full text-center">{r.time}</span>
					</PixelFrameMini>
				</div>
			{/each}
		</div>
	</PixelFrame>
</section>

<style>
    .lb-row { grid-template-columns: 3.2rem 3rem 1fr auto; }
    .lb-rank { min-width: 3.2rem; color: var(--color-text); }
    .lb-name { color: var(--color-text); max-width: 22rem; font-weight: 600; }
    .lb-time { width: 8.5rem; justify-self: end; display: inline-flex; align-items: center; justify-content: center; background: var(--color-bg); }
    .lb-title { font-size: 3rem; }
    @media (max-width: 1024px) { .lb-title { font-size: 2.5rem; } }
    @media (max-width: 640px) { .lb-title { font-size: 2.1rem; } }
    .lb-scroll { max-height: 60vh; overflow-y: auto; padding-bottom: 0.25rem; }
    .lb-scroll::-webkit-scrollbar { width: 10px; }
    .lb-scroll::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); border-radius: 8px; }
    .lb-scroll::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 8px; }
    .lb-scroll { scrollbar-width: thin; scrollbar-color: var(--color-primary) rgba(0, 0, 0, 0.2); }
</style>

<script context="module" lang="ts">
	export const ssr = false;
	import { api } from '../_api';

	type ProblemSummary = { id: string; title: string; difficulty: string };
	type ContestDetail = {
		id: string;
		name: string;
		startTime: string;
		endTime: string;
		problems: ProblemSummary[];
		userRank?: number | null;
	};

	export const load = async ({
															 params,
															 fetch
														 }: {
		params: Record<string, string>;
		fetch: typeof globalThis.fetch;
	}) => {
		try {
			const raw = await api<any>(`/api/Contest/${params.contestId}`, {}, fetch);
			const contest: ContestDetail = {
				id: String(raw.contestId),
				name: raw.contestName,
				startTime: raw.contestStartDateTime,
				endTime: raw.contestEndDateTime,
				userRank: raw.userRank ?? null,
				problems: (raw.problems ?? []).map((p: any) => ({
					id: String(p.id ?? p.problemId ?? p.contestProblemId ?? ''),
					title: p.title ?? p.name ?? 'Problem',
					difficulty: p.difficulty ?? 'Unknown'
				}))
			};
			return { contest };
		} catch {
			return { contest: undefined };
		}
	};
</script>
