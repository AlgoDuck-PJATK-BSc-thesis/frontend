<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import type { WeeklyReminderConfig, DayOfWeek, DayReminder } from '$lib/types/StudyTimerTypes';

	export let weeklyReminders: WeeklyReminderConfig = [];
	export let onConfigChange: ((config: WeeklyReminderConfig) => void) | undefined;
	export let onSave: ((config: WeeklyReminderConfig) => void) | undefined;

	const daysOrder: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
	const weekdayNames: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
	const weekendNames: DayOfWeek[] = ['Sat', 'Sun'];
	const hours = Array.from({ length: 24 }, (_, i) => i);

	function ensureAllDays(config: WeeklyReminderConfig): WeeklyReminderConfig {
		const map = new Map<DayOfWeek, DayReminder>();
		for (const r of config) {
			map.set(r.day, r);
		}
		return daysOrder.map((day) => {
			const existing = map.get(day);
			if (existing) return existing;
			return {
				day,
				enabled: false,
				hour: 18,
				minute: 0
			};
		});
	}

	$: normalizedConfig = ensureAllDays(weeklyReminders);
	$: weekdayConfigs = normalizedConfig.filter((r) => weekdayNames.includes(r.day));
	$: weekendConfigs = normalizedConfig.filter((r) => weekendNames.includes(r.day));
	$: hasAnyEnabled = normalizedConfig.some((r) => r.enabled);
	$: enabledDays = normalizedConfig.filter((r) => r.enabled);

	function emitConfig(config: WeeklyReminderConfig) {
		onConfigChange?.(config);
	}

	function toggleDay(day: DayOfWeek) {
		const updated = normalizedConfig.map((r) =>
			r.day === day ? { ...r, enabled: !r.enabled } : r
		);
		emitConfig(updated);
	}

	function setHour(day: DayOfWeek, hour: number) {
		const updated = normalizedConfig.map((r) => (r.day === day ? { ...r, hour } : r));
		emitConfig(updated);
	}

	function handleSave() {
		if (!hasAnyEnabled) return;
		onSave?.(normalizedConfig);
	}
</script>

<PixelFrameSimple
	className="relative w-full bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-8"
>
	<div class="flex items-center gap-3">
		<h2 class="mb-2 text-2xl font-bold">Set a reminder</h2>
	</div>

	<p class="mt-2 mb-6 text-sm text-[color:var(--color-text)] opacity-70">
		Choose on which days and at what hour you want a weekly reminder to study.
	</p>

	<div class="mb-4 space-y-2 text-sm">
		<div class="flex flex-wrap gap-2">
			{#each weekdayConfigs as dayConfig}
				<button
					type="button"
					class={`rounded-lg px-3 py-1 transition ${
						dayConfig.enabled
							? 'bg-[var(--color-primary)] text-black'
							: 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] text-[color:var(--color-text)] opacity-80 hover:opacity-100'
					}`}
					onclick={() => toggleDay(dayConfig.day)}
				>
					{dayConfig.day}
				</button>
			{/each}
		</div>

		<div class="flex flex-wrap gap-2">
			{#each weekendConfigs as dayConfig}
				<button
					type="button"
					class={`rounded-lg px-3 py-1 transition ${
						dayConfig.enabled
							? 'bg-[var(--color-primary)] text-black'
							: 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] text-[color:var(--color-text)] opacity-80 hover:opacity-100'
					}`}
					onclick={() => toggleDay(dayConfig.day)}
				>
					{dayConfig.day}
				</button>
			{/each}
		</div>
	</div>

	{#if enabledDays.length > 0}
		<div class="mt-2 space-y-3 text-sm">
			{#each enabledDays as dayConfig}
				<div class="flex items-center justify-between gap-4">
					<div class="w-16 font-semibold">{dayConfig.day}</div>
					<div class="flex items-center gap-2">
						<span class="opacity-80">Time</span>
						<select
							class="rounded-md bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-2 py-1 text-sm ring-1 ring-[color-mix(in_srgb,var(--color-text)_15%,transparent)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
							value={dayConfig.hour}
							onchange={(e) =>
								setHour(dayConfig.day, Number((e.target as HTMLSelectElement).value))}
						>
							{#each hours as h}
								<option value={h}>
									{String(h).padStart(2, '0')}:00
								</option>
							{/each}
						</select>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mt-2 text-xs text-[color:var(--color-text)] opacity-70">
			Select at least one day above to configure your weekly reminder.
		</p>
	{/if}

	<div class="mt-6 flex justify-start">
		<div class={hasAnyEnabled ? '' : 'pointer-events-none opacity-50'}>
			<Button
				size="small"
				label="Save"
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="1.2rem"
				labelFontWeight="normal"
				labelTracking="normal"
				labelClass=""
				onclick={handleSave}
			/>
		</div>
	</div>
</PixelFrameSimple>
