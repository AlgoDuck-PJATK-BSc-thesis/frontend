<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import WeeklyPicker from '$lib/Components/Pickers/WeeklyPicker.svelte';
	import type { WeeklyReminderConfig } from '$lib/types/StudyTimerTypes';

	export let weeklyReminders: WeeklyReminderConfig = [];
	export let onConfigChange: ((config: WeeklyReminderConfig) => void) | undefined;
	export let onSave: ((config: WeeklyReminderConfig) => void) | undefined;

	$: hasAnyEnabled = weeklyReminders.some((r) => r.enabled);

	function handleSave() {
		if (!hasAnyEnabled) return;
		onSave?.(weeklyReminders);
	}
</script>

<PixelFrameSimple
	className="relative w-full bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-8"
>
	<div class="flex items-center gap-3">
		<h2 class="mb-2 text-2xl font-bold text-[color:var(--color-landingpage-subtitle)]">
			Set a reminder
		</h2>
	</div>

	<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
		Choose on which days and at what hour you want a weekly reminder to study.
	</p>

	<WeeklyPicker
		value={weeklyReminders}
		onChange={(config) => {
			onConfigChange?.(config);
		}}
	/>

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
