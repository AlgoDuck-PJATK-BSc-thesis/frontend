<script lang="ts">
	type Tab = 'all' | 'search' | 'create' | 'update' | 'delete';

	type Props = {
		tab: Tab;
		onSwitchTab: (t: Tab) => void;
	};

	let { tab, onSwitchTab } = $props() as Props;

	const btnClass = (active: boolean) =>
		`px-3 py-1.5 rounded-sm text-xs font-semibold tracking-wider border ${
			active
				? 'bg-admin-accent-primary text-white border-admin-accent-primary'
				: 'bg-admin-bg-tertiary text-admin-text-primary border-admin-border-primary hover:bg-admin-bg-hover'
		}`;
</script>

<div class="mb-2 flex items-end justify-between border-b border-admin-border-primary py-4">
	<h2 class="text-2xl font-normal tracking-tight text-admin-text-primary">Cohorts</h2>

	<div class="flex items-center gap-2">
		<button type="button" onclick={() => onSwitchTab('create')} class={btnClass(tab === 'create')}
			>CREATE</button
		>
		<button type="button" onclick={() => onSwitchTab('all')} class={btnClass(tab === 'all')}
			>ALL</button
		>
		<button type="button" onclick={() => onSwitchTab('search')} class={btnClass(tab === 'search')}
			>SEARCH</button
		>
		<button type="button" onclick={() => onSwitchTab('update')} class={btnClass(tab === 'update')}
			>UPDATE</button
		>
		<button type="button" onclick={() => onSwitchTab('delete')} class={btnClass(tab === 'delete')}
			>DELETE</button
		>
	</div>
</div>
