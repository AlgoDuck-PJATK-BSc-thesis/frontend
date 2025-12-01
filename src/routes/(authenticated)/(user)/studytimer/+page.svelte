<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import RewardModal from './RewardModal.svelte';
	import DonutDiagram from './DonutDiagram.svelte';
	import SetTimerCard from './menu/SetTimer.svelte';
	import SetReminderCard from './menu/SetReminder.svelte';
	import type { EntryType, WeeklyReminderConfig } from '$lib/types/StudyTimerTypes';

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

	let entryType = $state<EntryType>('deadline');
	let deadlineISO = $state<string>('');
	let durationMin = $state<number>(25);

	let pickedDate = $state<Date | null>(null);
	let pickedHour = $state<number>(new Date().getHours());
	let pickedMinute = $state<number>(0);

	let weeklyReminders = $state<WeeklyReminderConfig>([
		{ day: 'Mon', enabled: false, hour: 18, minute: 0 },
		{ day: 'Tue', enabled: false, hour: 18, minute: 0 },
		{ day: 'Wed', enabled: false, hour: 18, minute: 0 },
		{ day: 'Thu', enabled: false, hour: 18, minute: 0 },
		{ day: 'Fri', enabled: false, hour: 18, minute: 0 },
		{ day: 'Sat', enabled: false, hour: 11, minute: 0 },
		{ day: 'Sun', enabled: false, hour: 11, minute: 0 }
	]);

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

	function syncISO() {
		if (!pickedDate) {
			deadlineISO = '';
			return;
		}
		const date = new Date(
			pickedDate.getFullYear(),
			pickedDate.getMonth(),
			pickedDate.getDate(),
			pickedHour,
			pickedMinute,
			0,
			0
		);
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, '0');
		const d = String(date.getDate()).padStart(2, '0');
		const hh2 = String(date.getHours()).padStart(2, '0');
		const mm2 = String(date.getMinutes()).padStart(2, '0');
		deadlineISO = `${y}-${m}-${d}T${hh2}:${mm2}`;
	}

	function confirmEnd() {
		const ok = window.confirm("Are you sure? Ending now won't earn any coins.");
		if (!ok) return;
		stopAndReturn();
	}
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
					class="ocr-outline ocr-title isolate mt-6 mb-10 [font-family:var(--font-ariw9500)] text-5xl font-black tracking-widest text-[var(--color-landingpage-title)]"
				>
					Study Timer
				</h1>
			{/if}
		</header>

		{#if stage === 'menu'}
			<section class="mx-auto mt-8 mb-10 w-full max-w-4xl">
				<div class="grid gap-6 md:grid-cols-2">
					<SetTimerCard
						{entryType}
						{pickedDate}
						{pickedHour}
						{pickedMinute}
						{durationMin}
						onEntryTypeChange={(type) => (entryType = type)}
						onDateChange={(date) => {
							pickedDate = date;
							syncISO();
						}}
						onTimeChange={({ hour, minute }) => {
							pickedHour = hour;
							pickedMinute = minute;
							if (pickedDate) {
								pickedDate = new Date(
									pickedDate.getFullYear(),
									pickedDate.getMonth(),
									pickedDate.getDate(),
									hour,
									minute,
									0,
									0
								);
							}
							syncISO();
						}}
						onDurationChange={(v) => {
							durationMin = v;
						}}
						onDeadlineStart={startCustomFromDeadline}
						onDurationStart={startCustomFromDuration}
						onDayStart={startDay}
					/>

					<SetReminderCard
						{weeklyReminders}
						onConfigChange={(config) => {
							weeklyReminders = config;
						}}
						onSave={(config) => {
							weeklyReminders = config;
						}}
					/>
				</div>
			</section>
		{/if}

		{#if stage === 'diagram'}
			<main bind:this={mainEl} class="mt-6 mb-1 grid items-start justify-items-center gap-4">
				<DonutDiagram
					{fractionRemaining}
					{hh}
					{mm}
					{ss}
					{tooltip}
					{useCustom}
					{mode}
					{entryType}
					onConfirmEnd={confirmEnd}
					onRestart={mode === 'custom' && entryType === 'duration'
						? () => {
								const mins = Math.max(1, Math.floor(durationMin || 0));
								customStart = new Date();
								customEnd = new Date(customStart.getTime() + mins * 60_000);
							}
						: undefined}
				/>
			</main>
		{/if}
	</div>

	<RewardModal open={rewardOpen} coins={rewardCoins} onClose={() => (rewardOpen = false)} />
</div>

<svelte:head>
	<title>Study Timer - AlgoDuck</title>
</svelte:head>
