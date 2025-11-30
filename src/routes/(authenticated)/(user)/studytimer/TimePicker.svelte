<script lang="ts">
	import { onMount } from 'svelte';

	export let hour = 0;
	export let minute = 0;
	export let onChange: ((value: { hour: number; minute: number }) => void) | undefined;

	const hours = Array.from({ length: 24 }, (_, i) => i);
	const minutesList = Array.from({ length: 60 }, (_, i) => i);

	let hourRef: HTMLElement | null = null;
	let minuteRef: HTMLElement | null = null;

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

	function selectHour(h: number) {
		hour = h;
		onChange?.({ hour, minute });
		queueMicrotask(() => scrollToSelected(hourRef, hours, hour));
	}

	function selectMinute(m: number) {
		minute = m;
		onChange?.({ hour, minute });
		queueMicrotask(() => scrollToSelected(minuteRef, minutesList, minute));
	}

	onMount(() => {
		queueMicrotask(() => {
			scrollToSelected(hourRef, hours, hour);
			scrollToSelected(minuteRef, minutesList, minute);
		});
	});
</script>

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
						class={`block h-10 w-full snap-center rounded-md px-3 text-left text-sm transition ${
							hour === h
								? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] font-semibold'
								: 'hover:bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]'
						}`}
						onclick={() => selectHour(h)}
					>
						{String(h).padStart(2, '0')}
					</button>
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
						class={`block h-10 w-full snap-center rounded-md px-3 text-left text-sm transition ${
							minute === m
								? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] font-semibold'
								: 'hover:bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]'
						}`}
						onclick={() => selectMinute(m)}
					>
						{String(m).padStart(2, '0')}
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
