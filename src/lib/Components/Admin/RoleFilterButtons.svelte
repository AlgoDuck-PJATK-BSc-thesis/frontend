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
		{disabled}
		aria-pressed={value === 'all'}
		class={`rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider disabled:cursor-not-allowed disabled:opacity-50 ${
			value === 'all'
				? 'border-admin-accent-primary bg-admin-accent-primary text-white'
				: 'border-admin-border-primary bg-admin-bg-tertiary text-admin-text-primary hover:bg-admin-bg-hover'
		}`}
	>
		All roles
	</button>

	<button
		type="button"
		onclick={() => setValue('users')}
		{disabled}
		aria-pressed={value === 'users'}
		class={`rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider disabled:cursor-not-allowed disabled:opacity-50 ${
			value === 'users'
				? 'border-admin-accent-primary bg-admin-accent-primary text-white'
				: 'border-admin-border-primary bg-admin-bg-tertiary text-admin-text-primary hover:bg-admin-bg-hover'
		}`}
	>
		Users
	</button>

	<button
		type="button"
		onclick={() => setValue('admins')}
		{disabled}
		aria-pressed={value === 'admins'}
		class={`rounded-sm border px-3 py-1.5 text-xs font-semibold tracking-wider disabled:cursor-not-allowed disabled:opacity-50 ${
			value === 'admins'
				? 'border-admin-accent-primary bg-admin-accent-primary text-white'
				: 'border-admin-border-primary bg-admin-bg-tertiary text-admin-text-primary hover:bg-admin-bg-hover'
		}`}
	>
		Admins
	</button>
</div>
