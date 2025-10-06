<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let now = $state(new Date());
	let timer: ReturnType<typeof setInterval> | undefined;

	const accent = 'hsl(0 80% 55%)';
	const accentBg = 'hsl(0 80% 55% / 0.18)';
	const track = 'hsl(0 0% 22%)';
	const bg = 'hsl(240 6% 7%)';
	const text = 'hsl(0 0% 92%)';

	let _pageEl: HTMLElement | null = null;
	let _mainEl = $state<HTMLElement | null>(null);
	let _ro: ResizeObserver | null = null;

	type Mode = 'day' | 'custom';
	type Stage = 'menu' | 'diagram';

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
		if (typeof ResizeObserver !== 'undefined' && _mainEl) {
			_ro = new ResizeObserver(() => updateLayout());
			_ro.observe(_mainEl);
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
		_ro?.disconnect();
	});

	function updateTime() {
		now = new Date();
	}

	function updateLayout() {
		if (typeof window === 'undefined' || typeof document === 'undefined') return;
		const vh = window.innerHeight || 0;
		const pt = _pageEl ? parseFloat(getComputedStyle(_pageEl).paddingTop) : 0;
		const pb = _pageEl ? parseFloat(getComputedStyle(_pageEl).paddingBottom) : 0;
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
		mode = 'day';
		entryType = 'deadline';
		deadlineISO = '';
		pickedDate = null;
		pickedHour = new Date().getHours();
		pickedMinute = 0;
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
		const hh = pad2(pickedDate.getHours());
		const mm = pad2(pickedDate.getMinutes());
		deadlineISO = `${y}-${m}-${d}T${hh}:${mm}`;
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

	onMount(() => {
		queueMicrotask(() => {
			scrollToSelected(hourRef, hours, pickedHour);
			scrollToSelected(minuteRef, minutesList, pickedMinute);
		});
	});
</script>

<div
	bind:this={_pageEl}
	class={(stage === 'menu'
		? 'grid min-h-dvh grid-rows-[auto_auto_auto]'
		: 'grid min-h-dvh grid-rows-[auto_1fr_auto]') + ' gap-8 p-6 font-sans'}
	style="--accent:{accent}; --accent-bg:{accentBg}; --track:{track}; --bg:{bg}; --text:{text}; background:{bg}; color:{text};"
>
	<header class="mx-auto w-full max-w-3xl">
		<h1 class="text-center text-4xl font-extrabold tracking-normal md:text-5xl">Study Timer</h1>
		{#if stage === 'menu'}
			<p class="mt-2 text-center text-white/70">Pick a mode to begin</p>
		{/if}
	</header>

	{#if stage === 'menu'}
		<section class="mx-auto w-full max-w-4xl">
			<div class="grid gap-6 md:grid-cols-2">
				<article
					class="group relative overflow-hidden rounded-2xl border border-white/10 p-6 transition hover:border-white/20 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
				>
					<div
						class="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-20 blur-2xl"
						style="background:radial-gradient(closest-side, var(--accent-bg), transparent)"
					></div>
					<div class="flex items-center gap-3">
						<div class="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-2xl">🌞</div>
						<h2 class="text-xl font-bold">Day timer</h2>
					</div>
					<p class="mt-2 text-sm text-white/70">Track remaining time until midnight</p>
					<button
						type="button"
						class="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition active:scale-[0.98]"
						onclick={startDay}>Start</button
					>
				</article>

				<article
					class="group relative overflow-hidden rounded-2xl border border-white/10 p-6 transition hover:border-white/20 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]"
				>
					<div
						class="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-20 blur-2xl"
						style="background:radial-gradient(closest-side, var(--accent-bg), transparent)"
					></div>
					<div class="flex items-center gap-3">
						<div class="grid h-12 w-12 place-items-center rounded-xl bg-white/5 text-2xl">⏱️</div>
						<h2 class="text-xl font-bold">Custom timer</h2>
					</div>
					<p class="mt-2 text-sm text-white/70">Set a deadline or a duration</p>

					<div class="mt-4 inline-flex overflow-hidden rounded-xl ring-1 ring-white/15">
						<button
							type="button"
							class={`px-3 py-1.5 text-xs transition md:text-sm ${entryType === 'deadline' ? 'bg-white/10' : ''}`}
							onclick={() => (entryType = 'deadline')}>Deadline</button
						>
						<button
							type="button"
							class={`px-3 py-1.5 text-xs transition md:text-sm ${entryType === 'duration' ? 'bg-white/10' : ''}`}
							onclick={() => (entryType = 'duration')}>Duration</button
						>
					</div>

					<div class="mt-3 grid gap-3" hidden={entryType !== 'deadline'}>
						<p class="text-xs opacity-80 md:text-sm">Pick date & time</p>

						<div class="rounded-xl border border-white/10 p-3">
							<div class="mb-2 flex items-center justify-between">
								<button
									type="button"
									class="rounded-md px-2 py-1 ring-1 ring-white/15"
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
									class="rounded-md px-2 py-1 ring-1 ring-white/15"
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
												class={`h-8 rounded-md text-sm transition ${cell.active ? 'bg-[var(--accent)] text-white' : 'bg-white/5 hover:bg-white/10'}`}
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
										class="relative h-48 snap-y snap-mandatory overflow-y-auto scroll-smooth rounded-xl bg-white/5 px-1 py-2 ring-1 ring-white/10"
										bind:this={hourRef}
									>
										{#each hours as h}
											<button
												type="button"
												class={`block h-10 w-full snap-center rounded-md px-3 text-left text-sm transition ${pickedHour === h ? 'bg-white/10 font-semibold' : 'hover:bg-white/10'}`}
												onclick={() => setHour(h)}>{String(h).padStart(2, '0')}</button
											>
										{/each}
									</div>
								</div>

								<div class="flex-1">
									<div class="mb-1 text-xs opacity-80">Minute</div>
									<div
										class="relative h-48 snap-y snap-mandatory overflow-y-auto scroll-smooth rounded-xl bg-white/5 px-1 py-2 ring-1 ring-white/10"
										bind:this={minuteRef}
									>
										{#each minutesList as m}
											<button
												type="button"
												class={`block h-10 w-full snap-center rounded-md px-3 text-left text-sm transition ${pickedMinute === m ? 'bg-white/10 font-semibold' : 'hover:bg-white/10'}`}
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
							>Duration (minutes)</label
						>
						<div class="flex items-center gap-2">
							<input
								id="durationInput"
								type="number"
								min="1"
								class="w-28 rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-[var(--accent)]"
								bind:value={durationMin}
							/>
							<div class="flex gap-1">
								<button
									type="button"
									class="rounded-lg px-2 py-1 text-xs ring-1 ring-white/15"
									onclick={() => (durationMin = 25)}>25</button
								>
								<button
									type="button"
									class="rounded-lg px-2 py-1 text-xs ring-1 ring-white/15"
									onclick={() => (durationMin = 30)}>30</button
								>
								<button
									type="button"
									class="rounded-lg px-2 py-1 text-xs ring-1 ring-white/15"
									onclick={() => (durationMin = 45)}>45</button
								>
								<button
									type="button"
									class="rounded-lg px-2 py-1 text-xs ring-1 ring-white/15"
									onclick={() => (durationMin = 60)}>60</button
								>
								<button
									type="button"
									class="rounded-lg px-2 py-1 text-xs ring-1 ring-white/15"
									onclick={() => (durationMin = 90)}>90</button
								>
							</div>
						</div>
						<button
							type="button"
							class="inline-flex w-fit items-center justify-center rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition active:scale-[0.98]"
							onclick={startCustomFromDuration}>Start</button
						>
					</div>
				</article>
			</div>
		</section>
	{/if}

	{#if stage === 'diagram'}
		<main bind:this={_mainEl} class="grid items-start justify-items-center gap-4">
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
					<div
						class="opacity-90"
						style="font-size:clamp(1rem,1rem+1vw,1.8rem); color:hsl(0 0% 85%);"
					>
						Remaining • {hh}:{mm}:{ss}
					</div>
				</div>
			</div>

			<div class="flex gap-3">
				<button
					type="button"
					class="rounded-xl px-4 py-2 text-sm ring-1 ring-white/15 transition active:scale-[0.98]"
					onclick={stopAndReturn}>End and return to menu</button
				>
				{#if mode === 'custom' && entryType === 'duration'}
					<button
						type="button"
						class="rounded-xl px-4 py-2 text-sm ring-1 ring-white/15 transition active:scale-[0.98]"
						onclick={() => {
							const mins = Math.max(1, Math.floor(durationMin || 0));
							customStart = new Date();
							customEnd = new Date(customStart.getTime() + mins * 60_000);
						}}>Restart</button
					>
				{/if}
			</div>
		</main>
	{/if}

	<footer class="grid place-items-center pt-1 text-[0.95rem] text-[hsl(0_0%_80%)] opacity-80">
		<small>Local time: {now.toLocaleTimeString()} • {now.toLocaleDateString()}</small>
	</footer>
</div>
