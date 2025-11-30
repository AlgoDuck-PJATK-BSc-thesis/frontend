<script lang="ts">
	import type { EntryType } from '$lib/types/StudyTimerTypes';

	export let fractionRemaining: number;
	export let hh: string;
	export let mm: string;
	export let ss: string;
	export let tooltip: string;
	export let useCustom: boolean;
	export let mode: 'day' | 'custom';
	export let entryType: EntryType;
	export let onConfirmEnd: () => void;
	export let onRestart: (() => void) | undefined;
</script>

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

		<div class="opacity-90" style="font-size:clamp(1rem,1rem+1vw,1.8rem); color:var(--color-text);">
			Remaining • {hh}:{mm}:{ss}
		</div>

		<div class="mt-5 flex gap-3">
			<button
				type="button"
				class="rounded-xl px-4 py-2 text-sm ring-1 ring-[var(--border-15)] transition hover:bg-[color:var(--color-primary)]/15
					hover:ring-[color:var(--color-primary)] focus-visible:ring-2
					focus-visible:ring-[color:var(--color-primary)] focus-visible:outline-none active:scale-[0.98]"
				onclick={onConfirmEnd}
			>
				End and return to menu
			</button>

			{#if mode === 'custom' && entryType === 'duration' && onRestart}
				<button
					type="button"
					class="rounded-xl px-4 py-2 text-sm ring-1 ring-[var(--border-15)] transition hover:bg-[color:var(--color-primary)]/15
						hover:ring-[color:var(--color-primary)] focus-visible:ring-2
						focus-visible:ring-[color:var(--color-primary)] focus-visible:outline-none active:scale-[0.98]"
					onclick={onRestart}
				>
					Restart
				</button>
			{/if}
		</div>
	</div>
</div>
