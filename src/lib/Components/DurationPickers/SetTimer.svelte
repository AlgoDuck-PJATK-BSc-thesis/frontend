<script lang="ts">
	import CalendarPicker from './CalendarPicker.svelte';
	import TimePicker from './TimePicker.svelte';
	import DurationPicker from './DurationPicker.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import type { EntryType } from '$lib/types/StudyTimerTypes';

	export let entryType: EntryType = 'deadline';
	export let pickedDate: Date | null = null;
	export let pickedHour: number;
	export let pickedMinute: number;
	export let durationMin: number;

	export let onEntryTypeChange: ((type: EntryType) => void) | undefined;
	export let onDateChange: ((date: Date) => void) | undefined;
	export let onTimeChange: ((value: { hour: number; minute: number }) => void) | undefined;
	export let onDurationChange: ((value: number) => void) | undefined;
	export let onDeadlineStart: (() => void) | undefined;
	export let onDurationStart: (() => void) | undefined;
	export let onDayStart: (() => void) | undefined;

	$: combinedDeadline = pickedDate
		? new Date(
				pickedDate.getFullYear(),
				pickedDate.getMonth(),
				pickedDate.getDate(),
				pickedHour,
				pickedMinute,
				0,
				0
			)
		: null;

	$: isPastDeadline = combinedDeadline ? combinedDeadline.getTime() <= Date.now() : false;
	$: deadlineDisabled = !pickedDate || isPastDeadline;

	function handleToggle(type: EntryType) {
		onEntryTypeChange?.(type);
	}

	function handleDeadlineClick() {
		if (deadlineDisabled) return;
		onDeadlineStart?.();
	}

	function handleDayClick() {
		onDayStart?.();
	}
</script>

<PixelFrameSimple
	className="relative w-full bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))] p-8"
>
	<div class="flex items-center gap-3 text-[color:var(--color-landingpage-subtitle)]">
		<h2 class="text-2xl font-bold">Set a timer</h2>
	</div>

	<div
		class="mt-4 mb-2 inline-flex overflow-hidden rounded-xl text-[color:var(--color-landingpage-subtitle)] ring-1 ring-[var(--border-15)]"
	>
		<button
			type="button"
			class={`px-3 py-1.5 text-xs transition md:text-sm ${
				entryType === 'deadline' ? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]' : ''
			}`}
			onclick={() => handleToggle('deadline')}
		>
			Deadline
		</button>
		<button
			type="button"
			class={`px-3 py-1.5 text-xs transition md:text-sm ${
				entryType === 'duration' ? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]' : ''
			}`}
			onclick={() => handleToggle('duration')}
		>
			Duration
		</button>
		<button
			type="button"
			class={`px-3 py-1.5 text-xs transition md:text-sm ${
				entryType === 'day' ? 'bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]' : ''
			}`}
			onclick={() => handleToggle('day')}
		>
			Day timer
		</button>
	</div>

	<div class="mt-3 grid gap-3" hidden={entryType !== 'deadline'}>
		<CalendarPicker
			selectedDate={pickedDate}
			onChange={(date) => {
				onDateChange?.(date);
			}}
		/>

		<div class="mt-3 grid gap-3">
			<TimePicker
				hour={pickedHour}
				minute={pickedMinute}
				onChange={(value) => {
					onTimeChange?.(value);
				}}
			/>
		</div>

		<div
			class="mt-3 flex items-center justify-between gap-4 text-[color:var(--color-landingpage-subtitle)]"
		>
			<div class="text-sm opacity-80">
				{#if pickedDate}
					{#if combinedDeadline}
						<div>{combinedDeadline.toLocaleString()}</div>
					{/if}
					{#if isPastDeadline}
						<div class="mt-1 text-xs text-red-300">Please choose a time in the future.</div>
					{/if}
				{:else}
					Choose a day and time then click Start.
				{/if}
			</div>

			<div class={deadlineDisabled ? 'pointer-events-none opacity-50' : ''}>
				<Button
					size="small"
					label="Start"
					labelFontFamily="var(--font-ariw9500)"
					labelColor="rgba(0,0,0,0.7)"
					labelFontSize="1.2rem"
					labelFontWeight="normal"
					labelTracking="normal"
					labelClass=""
					onclick={handleDeadlineClick}
				/>
			</div>
		</div>
	</div>

	<div class="mt-3 grid gap-3" hidden={entryType !== 'duration'}>
		<DurationPicker
			value={durationMin}
			onChange={(v) => {
				onDurationChange?.(v);
			}}
		/>
		<div class="mt-2 inline-flex w-fit">
			<Button
				size="small"
				label="Start"
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="1.2rem"
				labelFontWeight="normal"
				labelTracking="normal"
				labelClass=""
				onclick={onDurationStart}
			/>
		</div>
	</div>

	<div class="mt-3 grid gap-3" hidden={entryType !== 'day'}>
		<p class="mt-2 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-80">
			Track how much of the current day is left. The timer will count down until midnight.
		</p>
		<div class="mt-2 inline-flex w-fit">
			<Button
				size="small"
				label="Start"
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="1.2rem"
				labelFontWeight="normal"
				labelTracking="normal"
				labelClass=""
				onclick={handleDayClick}
			/>
		</div>
	</div>
</PixelFrameSimple>
