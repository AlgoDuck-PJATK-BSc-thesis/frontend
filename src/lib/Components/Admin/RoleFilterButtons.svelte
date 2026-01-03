<script lang="ts">
	export let value: 'all' | 'users' | 'admins' = 'all';
	export let disabled: boolean = false;

	const setValue = (v: 'all' | 'users' | 'admins') => {
		if (disabled) return;
		value = v;
	};
</script>

<div role="group" aria-label="Role filter" class="flex items-center gap-2">
	<button
		type="button"
		onclick={() => setValue('all')}
		disabled={disabled}
		aria-pressed={value === 'all'}
		class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border disabled:opacity-50 disabled:cursor-not-allowed ${
			value === 'all'
				? 'bg-[#0e639c] text-white border-[#0e639c]'
				: 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'
		}`}
	>
		All roles
	</button>

	<button
		type="button"
		onclick={() => setValue('users')}
		disabled={disabled}
		aria-pressed={value === 'users'}
		class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border disabled:opacity-50 disabled:cursor-not-allowed ${
			value === 'users'
				? 'bg-[#0e639c] text-white border-[#0e639c]'
				: 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'
		}`}
	>
		Users
	</button>

	<button
		type="button"
		onclick={() => setValue('admins')}
		disabled={disabled}
		aria-pressed={value === 'admins'}
		class={`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border disabled:opacity-50 disabled:cursor-not-allowed ${
			value === 'admins'
				? 'bg-[#0e639c] text-white border-[#0e639c]'
				: 'bg-[#2d2d2d] text-[#e7e7e7] border-[#3c3c3c] hover:bg-[#3a3a3a]'
		}`}
	>
		Admins
	</button>
</div>
