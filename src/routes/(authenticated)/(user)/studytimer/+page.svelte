<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import RewardModal from './RewardModal.svelte';

	type Mode = 'day' | 'custom';
	type Stage = 'menu' | 'diagram';

	let rewardOpen = $state(false);
	let rewardCoins = $state(0);
	let rewardShownForSession = $state(false);

	let now = $state(new Date());
	let timer: ReturnType<typeof setInterval> | undefined;

	let pageEl: HTMLElement | null = null;
	let mainEl = $state<HTMLElement | null>(null);
	let ro: ResizeObserver | null = null;

	let stage = $state<Stage>('menu');
	let mode = $state<Mode>('day');

	let customStart = $state<Date | null>(null);
	let customEnd = $state<Date | null>(null);

	let entryType = $state<'deadline' | 'duration'>('deadline');
	let deadlineISO = $state<string>('');
	let durationMin = $state<number>(25);

	let calView = $state(new Date());
	let pickedDate = $state<Date | null>(null);
	let pickedHour = $state<number>(new Date().getHours());
	let pickedMinute = $state<number>(0);

	const calYear = $derived(calView.getFullYear());
	const calMonth = $derived(calView.getMonth());

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
		rewardShownForSession = false;
	}

	function startCustomFromDeadline() {
		const end = deadlineISO ? new Date(deadlineISO) : null;
		customStart = new Date();
		customEnd = end && end > customStart ? end : null;
		if (customEnd) {
			mode = 'custom';
			stage = 'diagram';
			rewardShownForSession = false;
		}
	}

	function startCustomFromDuration() {
		const mins = Math.max(1, Math.floor(durationMin || 0));
		customStart = new Date();
		customEnd = new Date(customStart.getTime() + mins * 60_000);
		mode = 'custom';
		stage = 'diagram';
		rewardShownForSession = false;
	}

	function stopAndReturn() {
		stage = 'menu';
		customStart = null;
		customEnd = null;
		mode = 'day';
		entryType = 'deadline';
		deadlineISO = '';
		pickedDate = null;
		pickedHour = new Date().getHours();
		pickedMinute = 0;
		rewardOpen = false;
		rewardShownForSession = false;
	}

	const secondsInADay = 24 * 60 * 60;

	const secondsSinceMidnight = $derived(
		now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000
	);

	const useCustom = $derived(
		mode === 'custom' && !!customStart && !!customEnd && customEnd! > customStart!
	);

	const totalMs = $derived(
		useCustom ? customEnd!.getTime() - customStart!.getTime() : secondsInADay * 1000
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

	function firstWeekdayOfMonth(y: number, m: number) {
		return new Date(y, m, 1).getDay();
	}
	function daysInMonth(y: number, m: number) {
		return new Date(y, m + 1, 0).getDate();
	}
	function prevMonth() {
		calView = new Date(calYear, calMonth - 1, 1);
	}
	function nextMonth() {
		calView = new Date(calYear, calMonth + 1, 1);
	}
	function pad2(n: number) {
		return String(n).padStart(2, '0');
	}
	function pickDay(day: number) {
		pickedDate = new Date(calYear, calMonth, day, pickedHour, pickedMinute, 0, 0);
		syncISO();
	}
	function pickHour(h: number) {
		pickedHour = h;
		if (pickedDate)
			pickedDate = new Date(
				pickedDate.getFullYear(),
				pickedDate.getMonth(),
				pickedDate.getDate(),
				h,
				pickedMinute
			);
		syncISO();
	}
	function pickMinute(m: number) {
		pickedMinute = m;
		if (pickedDate)
			pickedDate = new Date(
				pickedDate.getFullYear(),
				pickedDate.getMonth(),
				pickedDate.getDate(),
				pickedHour,
				m
			);
		syncISO();
	}
	function syncISO() {
		if (!pickedDate) return;
		const y = pickedDate.getFullYear();
		const m = pad2(pickedDate.getMonth() + 1);
		const d = pad2(pickedDate.getDate());
		const hh2 = pad2(pickedDate.getHours());
		const mm2 = pad2(pickedDate.getMinutes());
		deadlineISO = `${y}-${m}-${d}T${hh2}:${mm2}`;
	}

	interface CalendarCell {
		label: number | null;
		active: boolean;
	}

	const calWeeks: CalendarCell[][] = $derived(
		(() => {
			const startPad = firstWeekdayOfMonth(calYear, calMonth);
			const total = daysInMonth(calYear, calMonth);
			const cells: CalendarCell[] = [];
			for (let i = 0; i < startPad; i++) cells.push({ label: null, active: false });
			for (let d = 1; d <= total; d++) {
				const active =
					!!pickedDate &&
					pickedDate.getFullYear() === calYear &&
					pickedDate.getMonth() === calMonth &&
					pickedDate.getDate() === d;
				cells.push({ label: d, active });
			}
			const weeks: CalendarCell[][] = [];
			for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
			return weeks;
		})()
	);

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const minutesList = Array.from({ length: 60 }, (_, i) => i);

	let hourRef = $state<HTMLElement | null>(null);
	let minuteRef = $state<HTMLElement | null>(null);

	function setHour(h: number) {
		pickedHour = h;
		if (pickedDate)
			pickedDate = new Date(
				pickedDate.getFullYear(),
				pickedDate.getMonth(),
				pickedDate.getDate(),
				h,
				pickedMinute
			);
		syncISO();
		queueMicrotask(() => scrollToSelected(hourRef, hours, pickedHour));
	}

	function setMinute(m: number) {
		pickedMinute = m;
		if (pickedDate)
			pickedDate = new Date(
				pickedDate.getFullYear(),
				pickedDate.getMonth(),
				pickedDate.getDate(),
				pickedHour,
				m
			);
		syncISO();
		queueMicrotask(() => scrollToSelected(minuteRef, minutesList, pickedMinute));
	}

	function scrollToSelected(container: HTMLElement | null, values: number[], current: number) {
		if (!container) return;
		const idx = values.indexOf(current);
		if (idx < 0) return;
		const item = container.children.item(idx) as HTMLElement | null;
		if (!item) return;
		const containerCenter = container.clientHeight / 2;
		const itemCenter = item.offsetTop + item.clientHeight / 2;
		container.scrollTo({ top: itemCenter - containerCenter, behavior: 'smooth' });
	}

	function confirmEnd() {
		const ok = window.confirm("Are you sure? Ending now won't earn any coins.");
		if (!ok) return;
		stopAndReturn();
	}

	onMount(() => {
		queueMicrotask(() => {
			scrollToSelected(hourRef, hours, pickedHour);
			scrollToSelected(minuteRef, minutesList, pickedMinute);
		});
	});

	$effect(() => {
		if (stage === 'diagram' && mode === 'custom' && remainingMs <= 0 && !rewardShownForSession) {
			const mins = Math.max(1, Math.round(totalMs / 60000));
			rewardCoins = mins;
			rewardOpen = true;
			rewardShownForSession = true;
		}
	});
</script>

<div
	bind:this={pageEl}
	class={(stage === 'menu'
		? 'grid min-h-dvh grid-rows-[auto_auto_auto]'
		: 'grid min-h-dvh grid-rows-[auto_1fr_auto]') + ' gap-8 p-6'}
	style=" --accent: var(--color-primary);
    --accent-bg: color-mix(in srgb, var(--color-primary) 18%, transparent);
    --track: color-mix(in srgb, var(--color-primary) 50%, transparent);
    --bg: var(--color-bg);
    --text: var(--color-text);
	--border-10: color-mix(in srgb, var(--color-text) 10%, transparent);
  	--border-15: color-mix(in srgb, var(--color-text) 15%, transparent);
	--accent-3-80: color-mix(in srgb, var(--color-accent-3) 80%, transparent);
	--accent-4-80: color-mix(in srgb, var(--color-accent-4) 80%, transparent);
	--tile-grad: linear-gradient(to bottom, var(--accent-3-80), var(--accent-4-80));
	--shadow-ambient: color-mix(in srgb, var(--color-text) 16%, transparent);
	--shadow-ambient-hover: color-mix(in srgb, var(--color-text) 28%, transparent);
    background: var(--color-bg);
    color: var(--color-text);"
>
	<div class={rewardOpen ? 'blur-sm transition' : ''}>
		<header class="mx-auto w-full max-w-3xl text-center">
			{#if stage === 'menu'}
				<h1
					class="ocr-outline ocr-title isolate mt-6 mb-8 [font-family:var(--font-ocra)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
				>
					Study Timer
				</h1>
				<!-- <p class="mt-2 text-center text-[var(--color-text)] opacity-80">Pick a mode to begin</p> -->
			{/if}
		</header>

		{#if stage === 'menu'}
			<section class="mx-auto mt-8 mb-10 w-full max-w-4xl">
				<div class="grid gap-6 md:grid-cols-2">
					<article
						class="group relative overflow-hidden rounded-2xl border [border-color:var(--border-10)] p-6
						shadow-[0_10px_30px_-10px_var(--shadow-ambient)] transition
						hover:[border-color:var(--border-15)]
						hover:shadow-[0_12px_34px_-12px_var(--shadow-ambient-hover)]"
						style="background: var(--tile-grad);"
					>
						<div
							class="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-20 blur-2xl"
							style="background:radial-gradient(closest-side, var(--accent-bg), transparent)"
						></div>
						<div class="flex items-center gap-3">
							<div
								class="grid h-12 w-12 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] text-2xl"
							>
								⏱️
							</div>
							<h2 class="text-xl font-bold">Set a timer</h2>
						</div>

						<div
							class="mt-4 mb-2 inline-flex overflow-hidden rounded-xl ring-1 ring-[var(--border-15)]"
						>
							<button
								type="button"
								class={`px-3 py-1.5 text-xs transition md:text-sm ${entryType === 'deadline' ? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]' : ''}`}
								onclick={() => (entryType = 'deadline')}>Deadline</button
							>
							<button
								type="button"
								class={`px-3 py-1.5 text-xs transition md:text-sm ${entryType === 'duration' ? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]' : ''}`}
								onclick={() => (entryType = 'duration')}>Duration</button
							>
						</div>

						<div class="mt-3 grid gap-3" hidden={entryType !== 'deadline'}>
							<!-- <p class="text-xs opacity-80 md:text-sm">Pick date & time</p> -->

							<div class="rounded-xl border border-[var(--border-10)] p-3">
								<div class="mb-2 flex items-center justify-between">
									<button
										type="button"
										class="rounded-md px-2 py-1 ring-1 ring-[var(--border-15)]"
										onclick={prevMonth}>‹</button
									>
									<div class="text-sm font-medium">
										{new Date(calYear, calMonth, 1).toLocaleString(undefined, {
											month: 'long',
											year: 'numeric'
										})}
									</div>
									<button
										type="button"
										class="rounded-md px-2 py-1 ring-1 ring-[var(--border-15)]"
										onclick={nextMonth}>›</button
									>
								</div>

								<div class="grid grid-cols-7 gap-1 text-center text-[0.75rem] opacity-70">
									<div>Sun</div>
									<div>Mon</div>
									<div>Tue</div>
									<div>Wed</div>
									<div>Thu</div>
									<div>Fri</div>
									<div>Sat</div>
								</div>

								<div class="mt-1 grid grid-cols-7 gap-1">
									{#each calWeeks as week}
										{#each week as cell}
											{#if cell.label === null}
												<div class="h-8 rounded-md bg-transparent"></div>
											{:else}
												<button
													type="button"
													class={`h-8 rounded-md text-sm transition ${cell.active ? 'bg-[var(--accent)] text-white' : 'bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]'}`}
													onclick={() => pickDay(cell.label!)}>{cell.label}</button
												>
											{/if}
										{/each}
									{/each}
								</div>
							</div>

							<div class="mt-3 grid gap-3">
								<div class="flex gap-4">
									<div class="flex-1">
										<div class="mb-1 text-xs opacity-80">Hour</div>
										<div
											class="relative h-48 snap-y snap-mandatory overflow-y-auto scroll-smooth rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-1 py-2 ring-1 ring-[var(--border-10)]"
											bind:this={hourRef}
										>
											{#each hours as h}
												<button
													type="button"
													class={`block h-10 w-full snap-center rounded-md px-3 text-left text-sm transition ${pickedHour === h ? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] font-semibold' : 'hover:bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]'}`}
													onclick={() => setHour(h)}>{String(h).padStart(2, '0')}</button
												>
											{/each}
										</div>
									</div>

									<div class="flex-1">
										<div class="mb-1 text-xs opacity-80">Minute</div>
										<div
											class="relative h-48 snap-y snap-mandatory overflow-y-auto scroll-smooth rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-1 py-2 ring-1 ring-[var(--border-10)]"
											bind:this={minuteRef}
										>
											{#each minutesList as m}
												<button
													type="button"
													class={`block h-10 w-full snap-center rounded-md px-3 text-left text-sm transition ${pickedMinute === m ? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] font-semibold' : 'hover:bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]'}`}
													onclick={() => setMinute(m)}>{String(m).padStart(2, '0')}</button
												>
											{/each}
										</div>
									</div>
								</div>
							</div>

							<div class="mt-3 flex items-center justify-between">
								<div class="text-sm opacity-80">
									{#if pickedDate}
										{pickedDate.toLocaleString()}
									{:else}
										Choose a day and time then click Start
									{/if}
								</div>
								<button
									type="button"
									class="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-50"
									onclick={startCustomFromDeadline}
									disabled={!pickedDate}>Start</button
								>
							</div>
						</div>

						<div class="mt-3 grid gap-3" hidden={entryType !== 'duration'}>
							<label for="durationInput" class="text-xs opacity-80 md:text-sm"
								>Duration in minutes:</label
							>
							<div class="flex items-center gap-2">
								<input
									id="durationInput"
									type="number"
									min="1"
									class="w-28 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
									px-3 py-2 ring-1 ring-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
									outline-none focus:ring-2 focus:ring-[var(--accent)]"
									bind:value={durationMin}
								/>
								<!-- <div class="flex gap-1">
									<button
										type="button"
										class="rounded-lg px-2 py-1 text-xs ring-1 ring-[var(--border-15)] transition
										hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
										hover:ring-[color-mix(in_srgb,var(--color-text)_22%,transparent)]
										focus-visible:ring-2
										focus-visible:ring-[var(--accent)] focus-visible:outline-none active:scale-[0.98]"
										onclick={() => (durationMin = 25)}>25</button
									>
									<button
										type="button"
										class="rounded-lg px-2 py-1 text-xs ring-1 ring-[var(--border-15)] transition
										hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
										hover:ring-[color-mix(in_srgb,var(--color-text)_22%,transparent)]
										focus-visible:ring-2
										focus-visible:ring-[var(--accent)] focus-visible:outline-none active:scale-[0.98]"
										onclick={() => (durationMin = 30)}>30</button
									>
									<button
										type="button"
										class="rounded-lg px-2 py-1 text-xs ring-1 ring-[var(--border-15)] transition
										hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
										hover:ring-[color-mix(in_srgb,var(--color-text)_22%,transparent)]
										focus-visible:ring-2
										focus-visible:ring-[var(--accent)] focus-visible:outline-none active:scale-[0.98]"
										onclick={() => (durationMin = 45)}>45</button
									>
									<button
										type="button"
										class="rounded-lg px-2 py-1 text-xs ring-1 ring-[var(--border-15)] transition
										hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
										hover:ring-[color-mix(in_srgb,var(--color-text)_22%,transparent)]
										focus-visible:ring-2
										focus-visible:ring-[var(--accent)] focus-visible:outline-none active:scale-[0.98]"
										onclick={() => (durationMin = 60)}>60</button
									>
									<button
										type="button"
										class="rounded-lg px-2 py-1 text-xs ring-1 ring-[var(--border-15)] transition
										hover:bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
										hover:ring-[color-mix(in_srgb,var(--color-text)_22%,transparent)]
										focus-visible:ring-2
										focus-visible:ring-[var(--accent)] focus-visible:outline-none active:scale-[0.98]"
										onclick={() => (durationMin = 90)}>90</button
									>
								</div> -->
							</div>
							<button
								type="button"
								class="mt-2 inline-flex w-fit items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition active:scale-[0.98]"
								onclick={startCustomFromDuration}>Start</button
							>
						</div>
					</article>
					<article
						class="group relative overflow-hidden rounded-2xl border [border-color:var(--border-10)] p-6
						shadow-[0_10px_30px_-10px_var(--shadow-ambient)] transition
						hover:[border-color:var(--border-15)]
						hover:shadow-[0_12px_34px_-12px_var(--shadow-ambient-hover)]"
						style="background: var(--tile-grad);"
					>
						<div
							class="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-20 blur-2xl"
							style="background:radial-gradient(closest-side, var(--accent-bg), transparent)"
						></div>
						<div class="flex items-center gap-3">
							<div
								class="grid h-12 w-12 place-items-center rounded-xl
              					bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
             					text-2xl"
							>
								🌞
							</div>
							<h2 class="text-xl font-bold">Day timer</h2>
						</div>
						<p class="mt-2 text-sm text-[color:var(--color-text)] opacity-70">
							Track remaining time until midnight
						</p>
						<button
							type="button"
							class="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition active:scale-[0.98]"
							onclick={startDay}>Start</button
						>
					</article>
				</div>
			</section>
		{/if}

		{#if stage === 'diagram'}
			<main bind:this={mainEl} class="mt-6 mb-1 grid items-start justify-items-center gap-4">
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
						style="inset:12%; background:var(--color-bg); box-shadow: inset 0 0 0 1px hsl(0 0% 100% / .02), 0 0 40px 0 hsl(0 80% 50% / .06);"
					></div>
					<div class="relative z-[1] grid gap-1 text-center">
						<div
							class="text-6xl leading-none font-semibold tracking-wide"
							style="font-size:clamp(5rem,3rem+8vw,12rem);
							color:color-mix(in srgb, var(--color-text) 80%, transparent);
							text-shadow:0 0 28px color-mix(in srgb, var(--color-primary) 15%, transparent);
							line-height:0.95;"
						>
							{(fractionRemaining * 100).toFixed(1)}%
						</div>
						<div
							class="opacity-90"
							style="font-size:clamp(1rem,1rem+1vw,1.8rem); color:var(--color-text);"
						>
							Remaining • {hh}:{mm}:{ss}
						</div>

						<div class="mt-5 flex gap-3">
							<button
								type="button"
								class="rounded-xl px-4 py-2 text-sm ring-1 ring-[var(--border-15)] transition hover:bg-[color:var(--color-primary)]/15
								hover:ring-[color:var(--color-primary)] focus-visible:ring-2
								focus-visible:ring-[color:var(--color-primary)] focus-visible:outline-none active:scale-[0.98]"
								onclick={confirmEnd}
							>
								End and return to menu
							</button>
							{#if mode === 'custom' && entryType === 'duration'}
								<button
									type="button"
									class="rounded-xl px-4 py-2 text-sm ring-1 ring-[var(--border-15)] transition hover:bg-[color:var(--color-primary)]/15
									hover:ring-[color:var(--color-primary)] focus-visible:ring-2
									focus-visible:ring-[color:var(--color-primary)] focus-visible:outline-none active:scale-[0.98]"
									onclick={() => {
										const mins = Math.max(1, Math.floor(durationMin || 0));
										customStart = new Date();
										customEnd = new Date(customStart.getTime() + mins * 60_000);
									}}>Restart</button
								>
							{/if}
						</div>
					</div>
				</div>
			</main>
		{/if}

		<!-- <footer
			class="mt-10 grid place-items-center pt-1 text-[0.95rem] text-[color:var(--color-text)] opacity-80"
		>
			<small>Local time: {now.toLocaleTimeString()} • {now.toLocaleDateString()}</small>
		</footer> -->
	</div>

	<RewardModal open={rewardOpen} coins={rewardCoins} onClose={() => (rewardOpen = false)} />
</div>

<svelte:head>
	<title>Study Timer - AlgoDuck</title>
</svelte:head>