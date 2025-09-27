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
	let mainEl: HTMLElement | null = null;
	let hintEl: HTMLElement | null = null;
	let footerEl: HTMLElement | null = null;
	let ro: ResizeObserver | null = null;

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
		const gap = mainEl ? parseFloat(getComputedStyle(mainEl).gap || '0') : 0;
		const hintH = hintEl?.offsetHeight || 0;
		const footerH = Math.max(24, footerEl?.offsetHeight || 0);
		const reserved = pt + pb + hintH + footerH + gap * 2 + 16;
		const available = Math.max(120, vh - reserved);
		const widthBound = Math.min(window.innerWidth * 0.95, 900);
		const donutSize = Math.max(200, Math.min(available * 0.9, widthBound));
		document.documentElement.style.setProperty('--donut-size', `${Math.round(donutSize)}px`);
	}

	const secondsInADay = 24 * 60 * 60;

	const secondsSinceMidnight = $derived(
		now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000
	);

	const fractionElapsed = $derived(secondsSinceMidnight / secondsInADay);
	const fractionRemaining = $derived(Math.max(0, 1 - fractionElapsed));

	const msLeft = $derived(Math.max(0, (secondsInADay - secondsSinceMidnight) * 1000));
	const hh = $derived(String(Math.floor(msLeft / 3_600_000)).padStart(2, '0'));
	const mm = $derived(String(Math.floor((msLeft % 3_600_000) / 60_000)).padStart(2, '0'));
	const ss = $derived(String(Math.floor((msLeft % 60_000) / 1000)).padStart(2, '0'));

	const tooltip = $derived(
		`${(fractionRemaining * 100).toFixed(1)}% dnia zostało • ${hh}:${mm}:${ss}`
	);
</script>

<div
	bind:this={pageEl}
	class="grid min-h-dvh grid-rows-[1fr_auto] font-sans"
	style="--accent:{accent}; --accent-bg:{accentBg}; --track:{track}; --bg:{bg}; --text:{text}; background:{bg}; color:{text};"
>
	<main bind:this={mainEl} class="grid place-items-center gap-2 overflow-clip">
		<div
			class="relative grid place-items-center"
			style="width:var(--donut-size,300px); max-width:82vw; aspect-ratio:1;"
			title={tooltip}
			aria-label="% of time left today"
		>
			<div
				class="pointer-events-none absolute rounded-full"
				style="inset:12%; filter:blur(10px); background:radial-gradient(40% 40% at 50% 50%, var(--accent-bg), transparent 70%);"
			></div>
			<div
				class="absolute inset-0 rounded-full"
				style="background:conic-gradient(var(--accent) calc({fractionRemaining} * 1turn), var(--track) 0);"
			></div>
			<div
				class="absolute rounded-full"
				style="inset:16%; background:{bg}; box-shadow: inset 0 0 0 1px hsl(0 0% 100% / .02), 0 0 40px 0 hsl(0 80% 50% / .06);"
			></div>
			<div class="relative z-[1] grid gap-1 text-center">
				<div
					class="mb-2 text-6xl leading-none font-black tracking-tight"
					style=" color:hsl(0 0% 98%); text-shadow:0 0 18px hsl(0 80% 55% / .15);"
				>
					{(fractionRemaining * 100).toFixed(1)}%
				</div>
				<div class="opacity-90" style="font-size:clamp(1rem,1rem+1vw,1.8rem); color:hsl(0 0% 85%);">
					Remaining • {hh}:{mm}:{ss}
				</div>
			</div>
		</div>

		<!-- <div
			class="relative mt-[-8rem] h-[9px] w-[min(90vw,620px)] overflow-hidden rounded-full shadow-[inset_0_0_0_1px_hsl(0_0%_100%_/_0.02)]"
			style="background:var(--track);"
			role="progressbar"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-valuenow={fractionRemaining * 100}
		>
			<div
				class="absolute inset-y-0 right-0 transition-[width] duration-300 ease-linear"
				style="width:calc({fractionRemaining} * 100%); background:var(--accent);"
			></div>
		</div> -->

		<p bind:this={hintEl} class="mt-[-15rem] text-center text-4xl text-[hsl(0_0%_78%)]">
			This is how much time you have left
		</p>
	</main>
	<footer
		bind:this={footerEl}
		class="mt-[-15rem] grid place-items-center pt-1 text-[0.95rem] text-[hsl(0_0%_80%)] opacity-80"
	>
		<small>Local time: {now.toLocaleTimeString()} • {now.toLocaleDateString()}</small>
	</footer>
</div>
