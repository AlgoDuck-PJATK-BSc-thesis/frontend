<script lang="ts">
	type CohortMemberRow = {
		userId: string;
		userName: string;
		email: string;
		joinedAt?: string | null;
	};

	export let members: CohortMemberRow[] = [];

	const formatJoinedAt = (value: string | null | undefined) => {
		if (!value) return '—';
		const d = new Date(value);
		if (Number.isNaN(d.getTime())) return '—';
		return d.toLocaleString();
	};
</script>

<div class="overflow-x-auto">
	<table class="w-full text-sm border-collapse">
		<thead>
			<tr class="text-left text-[#e7e7e7]">
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User ID</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">User name</th>
				<th class="py-2 pr-4 border-b border-[#3c3c3c]">Email</th>
				<th class="py-2 pr-0 border-b border-[#3c3c3c]">Joined at</th>
			</tr>
		</thead>
		<tbody>
			{#each members as m (m.userId)}
				<tr class="text-[#cccccc]">
					<td class="py-2 pr-4 border-b border-[#2a2a2a] font-mono text-xs">{m.userId}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{m.userName}</td>
					<td class="py-2 pr-4 border-b border-[#2a2a2a]">{m.email}</td>
					<td class="py-2 pr-0 border-b border-[#2a2a2a]">{formatJoinedAt(m.joinedAt)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
