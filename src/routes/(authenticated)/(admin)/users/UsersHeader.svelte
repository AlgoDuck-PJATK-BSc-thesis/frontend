<script lang="ts">
	import type { Tab } from '$lib/types/Admin';

	type Props = {
		tab: Tab;
		onSwitchTab: (t: Tab) => void;
	};

	let { tab, onSwitchTab } = $props() as Props;
</script>

<div class="flex items-end justify-between border-b border-admin-border-primary py-4">
	<h2 class="text-2xl font-normal tracking-tight text-admin-text-primary">Users</h2>

	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={() => onSwitchTab('create')}
			class={`rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider ${tab === 'create' ? 'border-admin-accent-primary bg-admin-accent-primary text-white' : 'border-admin-border-primary bg-admin-bg-tertiary text-admin-text-primary hover:bg-admin-bg-hover'}`}
		>
			CREATE
		</button>
		<button
			type="button"
			onclick={() => onSwitchTab('all')}
			class={`rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider ${tab === 'all' ? 'border-admin-accent-primary bg-admin-accent-primary text-white' : 'border-admin-border-primary bg-admin-bg-tertiary text-admin-text-primary hover:bg-admin-bg-hover'}`}
		>
			ALL
		</button>
		<button
			type="button"
			onclick={() => onSwitchTab('search')}
			class={`rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider ${tab === 'search' ? 'border-admin-accent-primary bg-admin-accent-primary text-white' : 'border-admin-border-primary bg-admin-bg-tertiary text-admin-text-primary hover:bg-admin-bg-hover'}`}
		>
			SEARCH
		</button>
		<button
			type="button"
			onclick={() => onSwitchTab('update')}
			class={`rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider ${tab === 'update' ? 'border-admin-accent-primary bg-admin-accent-primary text-white' : 'border-admin-border-primary bg-admin-bg-tertiary text-admin-text-primary hover:bg-admin-bg-hover'}`}
		>
			UPDATE
		</button>
		<button
			type="button"
			onclick={() => onSwitchTab('delete')}
			class={`rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider ${tab === 'delete' ? 'border-admin-accent-primary bg-admin-accent-primary text-white' : 'border-admin-border-primary bg-admin-bg-tertiary text-admin-text-primary hover:bg-admin-bg-hover'}`}
		>
			DELETE
		</button>
	</div>
</div>
