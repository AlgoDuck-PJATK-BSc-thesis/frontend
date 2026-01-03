<script lang="ts">
	import type { Tab } from '$lib/Components/Admin/Users/types';

	type Props = {
		tab: Tab;
		onSwitchTab: (t: Tab) => void;
	};

	let { tab, onSwitchTab } = $props() as Props;
</script>

<div class="py-4 border-b border-[#3c3c3c] flex items-end justify-between">
	<h2 class="text-2xl font-normal text-[#e7e7e7] tracking-tight">Users</h2>

	<div class="flex items-center gap-2">
		<button
			type="button"
			onclick={() => onSwitchTab('create')}
			class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border ${tab === 'create' ? 'bg-[#0e639c] text-white border-[#0e639c]' : 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'}`}
		>
			CREATE
		</button>
		<button
			type="button"
			onclick={() => onSwitchTab('all')}
			class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border ${tab === 'all' ? 'bg-[#0e639c] text-white border-[#0e639c]' : 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'}`}
		>
			ALL
		</button>
		<button
			type="button"
			onclick={() => onSwitchTab('search')}
			class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border ${tab === 'search' ? 'bg-[#0e639c] text-white border-[#0e639c]' : 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'}`}
		>
			SEARCH
		</button>
		<button
			type="button"
			onclick={() => onSwitchTab('update')}
			class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border ${tab === 'update' ? 'bg-[#0e639c] text-white border-[#0e639c]' : 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'}`}
		>
			UPDATE
		</button>
		<button
			type="button"
			onclick={() => onSwitchTab('delete')}
			class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border ${tab === 'delete' ? 'bg-[#a1260d] text-white border-[#a1260d]' : 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'}`}
		>
			DELETE
		</button>
	</div>
</div>
