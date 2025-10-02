<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let now = $state(new Date());
	let timer: ReturnType<typeof setInterval> | undefined;

	const accent = 'hsl(0 80% 55%)';
	const accentBg = 'hsl(0 80% 55% / 0.18)';
	const track = 'hsl(0 0% 22%)';
	const bg = 'hsl(240 6% 7%)';
	const text = 'hsl(0 0% 92%)';

	let pageEl: HTMLElement | null = null;
	let mainEl = $state<HTMLElement | null>(null);
	let ro: ResizeObserver | null = null;

	type Mode = 'day' | 'custom';
	type Stage = 'menu' | 'diagram';

	let stage = $state<Stage>('menu');
	let mode = $state<Mode>('day');

	let customStart = $state<Date | null>(null);
	let customEnd = $state<Date | null>(null);

	let entryType = $state<'deadline' | 'duration'>('deadline');
	let deadlineISO = $state<string>('');
	let durationMin = $state<number>(25);

	const deadlineInputId = 'deadlineInput';
	const durationInputId = 'durationInput';

	onMount(() => {
		updateTime();
		timer = setInterval(updateTime, 1000);
		updateLayout();
		if (typeof ResizeObserver !== 'undefined' && mainEl) {
			ro = new ResizeObserver(() => updateLayout());
			ro.observe(mainEl);
		}
		if (typeof window !== 'undefined') {
			window.addEventListener('resize', updateLayout);
			window.addEventListener('orientationchange', updateLayout);
			queueMicrotask(updateLayout);
		}
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', updateLayout);
			window.removeEventListener('orientationchange', updateLayout);
		}
		ro?.disconnect();
	});

	function updateTime() {
		now = new Date();
	}

	function updateLayout() {
		if (typeof window === 'undefined' || typeof document === 'undefined') return;
		const vh = window.innerHeight || 0;
		const pt = pageEl ? parseFloat(getComputedStyle(pageEl).paddingTop) : 0;
		const pb = pageEl ? parseFloat(getComputedStyle(pageEl).paddingBottom) : 0;
		const reserved = pt + pb + 120;
		const available = Math.max(120, vh - reserved);
		const widthBound = Math.min(window.innerWidth * 0.95, 900);
		const donutSize = Math.max(220, Math.min(available * 0.9, widthBound));
		document.documentElement.style.setProperty('--donut-size', `${Math.round(donutSize)}px`);
	}

	function startDay() {
		mode = 'day';
		stage = 'diagram';
	}

	function startCustomFromDeadline() {
		const end = deadlineISO ? new Date(deadlineISO) : null;
		customStart = new Date();
		customEnd = end && end > customStart ? end : null;
		if (customEnd) {
			mode = 'custom';
			stage = 'diagram';
		}
	}

	function startCustomFromDuration() {
		const mins = Math.max(1, Math.floor(durationMin || 0));
		customStart = new Date();
		customEnd = new Date(customStart.getTime() + mins * 60_000);
		mode = 'custom';
		stage = 'diagram';
	}

	function stopAndReturn() {
		stage = 'menu';
		customStart = null;
		customEnd = null;
	}

	const secondsInADay = 24 * 60 * 60;

	const secondsSinceMidnight = $derived(
		now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000
	);

	const useCustom = $derived(mode === 'custom' && !!customStart && !!customEnd && customEnd! > customStart!);

	const totalMs = $derived(
		useCustom
			? (customEnd!.getTime() - customStart!.getTime())
			: secondsInADay * 1000
	);

	const elapsedMs = $derived(
		useCustom
			? Math.max(0, now.getTime() - customStart!.getTime())
			: Math.max(0, secondsSinceMidnight * 1000)
	);

	const remainingMs = $derived(Math.max(0, totalMs - elapsedMs));

	const fractionElapsed = $derived(totalMs > 0 ? Math.min(1, elapsedMs / totalMs) : 0);
	const fractionRemaining = $derived(1 - fractionElapsed);

	const hh = $derived(String(Math.floor(remainingMs / 3_600_000)).padStart(2, '0'));
	const mm = $derived(String(Math.floor((remainingMs % 3_600_000) / 60_000)).padStart(2, '0'));
	const ss = $derived(String(Math.floor((remainingMs % 60_000) / 1000)).padStart(2, '0'));

	const tooltip = $derived(
		useCustom
			? `${(fractionRemaining * 100).toFixed(1)}% remaining • ${hh}:${mm}:${ss}`
			: `${(fractionRemaining * 100).toFixed(1)}% of day left • ${hh}:${mm}:${ss}`
	);
</script>

<div
	bind:this={pageEl}
	class="min-h-dvh grid grid-rows-[auto_1fr_auto] gap-6 p-6 font-sans"
	style="--accent:{accent}; --accent-bg:{accentBg}; --track:{track}; --bg:{bg}; --text:{text}; background:{bg}; color:{text};"
>
	<header class="mx-auto w-full max-w-3xl">
		<h1 class="text-center text-5xl font-bold tracking-tight">Study timer</h1>
	</header>

	{#if stage === 'menu'}
	<section class="mx-auto w-full max-w-xl rounded-xl border border-white/10 p-5">
		<div class="grid gap-4">
			<div class="grid grid-cols-2 gap-2">
				<button
					type="button"
					class="rounded-md px-3 py-2 text-sm ring-1 ring-white/15 transition active:scale-[0.98]"
					onclick={startDay}
				>Day timer</button>
				<button
					type="button"
					class="rounded-md px-3 py-2 text-sm ring-1 ring-white/15 transition active:scale-[0.98]"
					onclick={() => { mode = 'custom'; }}
				>Custom timer</button>
			</div>

			<div class="grid gap-4" hidden={mode !== 'custom'}>
				<div class="flex gap-3">
					<button
						type="button"
						class="rounded-md px-3 py-1.5 text-xs ring-1 ring-white/15"
						class:opacity-60={entryType !== 'deadline'}
						onclick={() => entryType = 'deadline'}
					>Deadline</button>
					<button
						type="button"
						class="rounded-md px-3 py-1.5 text-xs ring-1 ring-white/15"
						class:opacity-60={entryType !== 'duration'}
						onclick={() => entryType = 'duration'}
					>Duration</button>
				</div>

				<div class="grid gap-2" hidden={entryType !== 'deadline'}>
					<label for={deadlineInputId} class="text-sm opacity-80">Target date & time</label>
					<input
						id={deadlineInputId}
						type="datetime-local"
						class="w-full rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[var(--accent)]"
						bind:value={deadlineISO}
					/>
					<button
						type="button"
						class="mt-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white"
						onclick={startCustomFromDeadline}
					>Start</button>
				</div>

				<div class="grid gap-2" hidden={entryType !== 'duration'}>
					<label for={durationInputId} class="text-sm opacity-80">Duration (minutes)</label>
					<div class="flex items-center gap-2">
						<input
							id={durationInputId}
							type="number" min="1"
							class="w-28 rounded-md bg-white/5 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-[var(--accent)]"
							bind:value={durationMin}
						/>
						<div class="flex gap-1">
							<button type="button" class="rounded px-2 py-1 text-xs ring-1 ring-white/15" onclick={() => durationMin = 5}>5</button>
							<button type="button" class="rounded px-2 py-1 text-xs ring-1 ring-white/15" onclick={() => durationMin = 15}>15</button>
							<button type="button" class="rounded px-2 py-1 text-xs ring-1 ring-white/15" onclick={() => durationMin = 25}>25</button>
							<button type="button" class="rounded px-2 py-1 text-xs ring-1 ring-white/15" onclick={() => durationMin = 60}>60</button>
						</div>
					</div>
					<button
						type="button"
						class="mt-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm text-white"
						onclick={startCustomFromDuration}
					>Start</button>
				</div>
			</div>
		</div>
	</section>
	{/if}

	{#if stage === 'diagram'}
	<main bind:this={mainEl} class="grid items-start justify-items-center gap-4">
		<div
			class="relative grid place-items-center"
			style="width:var(--donut-size,300px); max-width:92vw; aspect-ratio:1;"
			title={tooltip}
			aria-label={useCustom ? '% left until timer ends' : '% of day remaining'}
		>
			<div
				class="pointer-events-none absolute rounded-full"
				style="inset:10%; filter:blur(10px); background:radial-gradient(40% 40% at 50% 50%, var(--accent-bg), transparent 70%);"
			></div>
			<div
				class="absolute inset-0 rounded-full"
				style="background:conic-gradient(var(--accent) calc({fractionRemaining} * 1turn), var(--track) 0);"
			></div>
			<div
				class="absolute rounded-full"
				style="inset:12%; background:{bg}; box-shadow: inset 0 0 0 1px hsl(0 0% 100% / .02), 0 0 40px 0 hsl(0 80% 50% / .06);"
			></div>
			<div class="relative z-[1] grid gap-1 text-center">
				<div
					class="leading-none font-black tracking-tight"
					style="font-size:clamp(5rem,3rem+8vw,12rem); color:hsl(0 0% 98%); text-shadow:0 0 28px hsl(0 80% 55% / .25); line-height:0.95;"
				>
					{(fractionRemaining * 100).toFixed(1)}%
				</div>
				<div class="opacity-90" style="font-size:clamp(1rem,1rem+1vw,1.8rem); color:hsl(0 0% 85%);">
					{useCustom ? 'Remaining' : 'Remaining'} • {hh}:{mm}:{ss}
				</div>
			</div>
		</div>

		<div class="flex gap-3">
			<button
				type="button"
				class="rounded-md px-4 py-2 text-sm ring-1 ring-white/15 transition active:scale-[0.98]"
				onclick={stopAndReturn}
			>End and return to menu</button>
			{#if mode === 'custom' && entryType === 'duration'}
			<button
				type="button"
				class="rounded-md px-4 py-2 text-sm ring-1 ring-white/15 transition active:scale-[0.98]"
				onclick={() => { customStart = new Date(); customEnd = new Date(customStart.getTime() + Math.max(1, Math.floor(durationMin || 0)) * 60_000); }}
			>Restart</button>
			{/if}
		</div>
	</main>
	{/if}

	<footer class="grid place-items-center pt-1 text-[0.95rem] text-[hsl(0_0%_80%)] opacity-80">
		<small>Local time: {now.toLocaleTimeString()} • {now.toLocaleDateString()}</small>
	</footer>
</div>