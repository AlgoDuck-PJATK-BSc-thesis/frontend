<script lang="ts">
	const {
		open = false,
		coins = 0,
		onClose
	} = $props<{
		open?: boolean;
		coins?: number;
		onClose?: () => void;
	}>();
</script>

{#if open}
	<div class="fixed inset-0 z-50 grid place-items-center">
		<div class="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
		<div
			class="relative z-10 w-[min(92vw,26rem)] rounded-2xl bg-[hsl(240_6%_10%)] p-6 ring-1 ring-white/10"
		>
			<h2 class="text-xl font-bold">Great job!</h2>
			<div class="mt-1 text-5xl font-extrabold tracking-tight">{coins}</div>
			<p class="text-sm text-white/70">coin{coins === 1 ? '' : 's'} for focused minutes</p>
			<div class="mt-5 flex justify-end">
				<button
					type="button"
					class="rounded-xl px-4 py-2 text-sm ring-1 ring-white/15"
					onclick={() => onClose?.()}
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}
