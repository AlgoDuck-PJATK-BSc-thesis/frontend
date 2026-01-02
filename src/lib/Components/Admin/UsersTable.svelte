<script lang="ts">
	type UserRow = {
		userId: string;
		email: string;
		username: string;
		roles: string[];
	};

	export let users: UserRow[] = [];
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="text-left text-[#e7e7e7]">
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User ID</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
				<th class="py-2 pr-0 border-b border-[#3c3c3c]">Roles</th>
			</tr>
		</thead>
		<tbody>
			{#each users as u (u.userId)}
				<tr class="text-[#cccccc]">
					<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs">{u.userId}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.username}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{u.email}</td>
					<td class="py-2 pr-0 border-b border-[#2a2a2a]">{u.roles.join(', ')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
