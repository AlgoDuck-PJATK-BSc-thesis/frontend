<script lang="ts">
	type UserRow = {
		userId: string;
		email: string;
		username: string;
		roles: string[];
	};

	type Props = {
		users?: UserRow[];
		selectedUserId?: string | null;
		disabled?: boolean;
		onSelect?: (u: UserRow) => void;
	};

	let { users = [], selectedUserId = null, disabled = false, onSelect = () => {} } = $props() as Props;
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="text-left text-[#e7e7e7]">
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User ID</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Roles</th>
				<th class="py-2 pr-0 border-b border-[#3c3c3c]"></th>
			</tr>
		</thead>
		<tbody>
			{#each users as u (u.userId)}
				<tr class={u.userId === selectedUserId ? 'bg-[#1f2a33] text-[#e7e7e7]' : 'text-[#cccccc]'}>
					<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs">{u.userId}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.username}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.email}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{(u.roles ?? []).join(', ')}</td>
					<td class="py-2 pr-0 border-b border-[#2a2a2a] text-right">
						<button
							type="button"
							onclick={() => onSelect(u)}
							disabled={disabled}
							class="px-3 py-1.5 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Select
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
