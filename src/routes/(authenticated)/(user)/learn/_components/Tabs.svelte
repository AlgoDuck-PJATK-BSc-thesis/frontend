<script lang="ts">
	type Tab = { id: string; label: string };

	let { tabs, active, onChange } = $props<{
		tabs: Tab[];
		active: string;
		onChange: (id: string) => void;
	}>();
</script>

<div class="flex flex-wrap items-center justify-center gap-2">
	{#each tabs as tab}
		<button
			type="button"
			onclick={() => onChange(tab.id)}
			class={[
				'rounded-xl border px-4 py-2 text-sm font-semibold transition',
				active === tab.id
					? 'border-white/30 bg-white/10 text-white'
					: 'border-white/10 bg-slate-900/50 text-[color:var(--color-landingpage-subtitle)] hover:bg-slate-800/50'
			].join(' ')}
		>
			{tab.label}
		</button>
	{/each}
</div>
