<script lang="ts">
	export let value: number = 25;
	export let onChange: ((value: number) => void) | undefined;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const parsed = Number(target.value);
		const v = Math.max(1, Math.floor(isNaN(parsed) ? 1 : parsed));
		value = v;
		onChange?.(v);
	}
</script>

<div class="mt-3 grid gap-3">
	<label for="durationInput" class="text-xs opacity-80 md:text-sm"> Duration in minutes: </label>
	<div class="flex items-center gap-2">
		<input
			id="durationInput"
			type="number"
			min="1"
			class="w-28 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
			px-3 py-2 ring-1 ring-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
			outline-none focus:ring-2 focus:ring-[var(--accent)]"
			{value}
			oninput={handleInput}
		/>
	</div>
</div>
