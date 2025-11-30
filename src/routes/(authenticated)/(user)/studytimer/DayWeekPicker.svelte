<script lang="ts">
	import type { Weekday } from '$lib/types/StudyTimerTypes';

	export let selectedDays: Weekday[] = [];
	export let onChange: ((days: Weekday[]) => void) | undefined;

	const allDays: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	function toggle(day: Weekday) {
		const isSelected = selectedDays.includes(day);
		const next = isSelected ? selectedDays.filter((d) => d !== day) : [...selectedDays, day];
		onChange?.(next);
	}
</script>

<div class="grid grid-cols-7 gap-1">
	{#each allDays as day}
		<button
			type="button"
			class={`h-9 rounded-md text-xs transition md:text-sm ${
				selectedDays.includes(day)
					? 'bg-[var(--color-primary)] text-black'
					: 'bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] text-[color:var(--color-text)] opacity-80 hover:bg-[color-mix(in_srgb,var(--color-text)_16%,transparent)]'
			}`}
			onclick={() => toggle(day)}
		>
			{day}
		</button>
	{/each}
</div>
