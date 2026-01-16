<script lang="ts">
	export let selectedDate: Date | null = null;
	export let onChange: (date: Date) => void;

	let viewDate = selectedDate ? new Date(selectedDate) : new Date();

	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function firstWeekdayOfMonth(y: number, m: number) {
		return new Date(y, m, 1).getDay();
	}

	function daysInMonth(y: number, m: number) {
		return new Date(y, m + 1, 0).getDate();
	}

	$: year = viewDate.getFullYear();
	$: month = viewDate.getMonth();

	type CalendarCell = {
		label: number | null;
		active: boolean;
	};

	$: calWeeks = (() => {
		const startPad = firstWeekdayOfMonth(year, month);
		const total = daysInMonth(year, month);
		const cells: CalendarCell[] = [];
		for (let i = 0; i < startPad; i++) cells.push({ label: null, active: false });
		for (let d = 1; d <= total; d++) {
			const active =
				!!selectedDate &&
				selectedDate.getFullYear() === year &&
				selectedDate.getMonth() === month &&
				selectedDate.getDate() === d;
			cells.push({ label: d, active });
		}
		const weeks: CalendarCell[][] = [];
		for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
		return weeks;
	})();

	function prevMonth() {
		viewDate = new Date(year, month - 1, 1);
	}

	function nextMonth() {
		viewDate = new Date(year, month + 1, 1);
	}

	function pickDay(day: number) {
		const base = selectedDate ?? new Date();
		const date = new Date(year, month, day, base.getHours(), base.getMinutes(), 0, 0);
		selectedDate = date;
		onChange?.(date);
	}
</script>

<div
	class="rounded-xl border border-[var(--border-10)] p-3 text-[color:var(--color-landingpage-subtitle)]"
>
	<div class="mb-2 flex items-center justify-between">
		<button
			type="button"
			class="rounded-md px-2 py-1 ring-1 ring-[var(--border-15)]"
			onclick={prevMonth}
		>
			‹
		</button>
		<div class="text-sm font-medium">
			{new Date(year, month, 1).toLocaleString(undefined, {
				month: 'long',
				year: 'numeric'
			})}
		</div>
		<button
			type="button"
			class="rounded-md px-2 py-1 ring-1 ring-[var(--border-15)]"
			onclick={nextMonth}
		>
			›
		</button>
	</div>

	<div class="grid grid-cols-7 gap-1 text-center text-[0.75rem] opacity-70">
		{#each weekdays as label}
			<div>{label}</div>
		{/each}
	</div>

	<div class="mt-1 grid grid-cols-7 gap-1">
		{#each calWeeks as week}
			{#each week as cell}
				{#if cell.label === null}
					<div class="h-8 rounded-md bg-transparent"></div>
				{:else}
					<button
						type="button"
						class={`h-8 rounded-md text-sm transition ${
							cell.active
								? 'bg-[var(--accent)] text-white'
								: 'bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]'
						}`}
						onclick={() => pickDay(cell.label as number)}
					>
						{cell.label}
					</button>
				{/if}
			{/each}
		{/each}
	</div>
</div>
