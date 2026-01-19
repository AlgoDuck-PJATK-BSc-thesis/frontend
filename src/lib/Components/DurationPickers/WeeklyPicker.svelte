<script lang="ts">
	import type { WeeklyReminderConfig, DayOfWeek, DayReminder } from '$lib/types/StudyTimerTypes';

	export let value: WeeklyReminderConfig = [];
	export let onChange: ((config: WeeklyReminderConfig) => void) | undefined;

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

	$: normalizedConfig = ensureAllDays(value);
	$: weekdayConfigs = normalizedConfig.filter((r) => weekdayNames.includes(r.day));
	$: weekendConfigs = normalizedConfig.filter((r) => weekendNames.includes(r.day));
	$: enabledDays = normalizedConfig.filter((r) => r.enabled);

	function emitConfig(config: WeeklyReminderConfig) {
		onChange?.(config);
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
</script>

<div
	class="rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-3 text-sm text-[color:var(--color-landingpage-subtitle)]"
>
	<div class="mb-3 text-xs font-semibold tracking-wide uppercase opacity-80">Weekly reminder</div>

	<div class="mb-4 space-y-2">
		<div class="flex flex-wrap gap-2">
			{#each weekdayConfigs as dayConfig}
				<button
					type="button"
					class={`rounded-lg px-3 py-1 transition ${
						dayConfig.enabled
							? 'bg-[var(--color-primary)] text-[color:var(--color-landingpage-subtitle)]'
							: 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] text-[color:var(--color-landingpage-subtitle)] opacity-80 hover:opacity-100'
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
							? 'bg-[var(--color-primary)] text-[color:var(--color-landingpage-subtitle)]'
							: 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] text-[color:var(--color-landingpage-subtitle)] opacity-80 hover:opacity-100'
					}`}
					onclick={() => toggleDay(dayConfig.day)}
				>
					{dayConfig.day}
				</button>
			{/each}
		</div>
	</div>

	{#if enabledDays.length > 0}
		<div class="space-y-3 text-xs">
			{#each enabledDays as dayConfig}
				<div class="flex items-center justify-between gap-4">
					<div class="w-16 text-sm font-semibold">{dayConfig.day}</div>
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
		<p class="text-xs opacity-70">
			Select at least one day above to configure your weekly reminder.
		</p>
	{/if}
</div>
