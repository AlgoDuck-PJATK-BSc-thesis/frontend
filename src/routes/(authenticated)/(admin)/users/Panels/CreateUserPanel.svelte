<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	type Role = 'user' | 'admin';

	type CreatedUser = {
		userId: string;
		email: string;
		username: string;
		role: string;
	};

	export let disabled: boolean = false;
	export let creating: boolean = false;
	export let error: string | null = null;
	export let created: CreatedUser | null = null;
	export let onCreate: (email: string, password: string, role: Role) => void;

	let email = '';
	let password = '';
	let role: Role = 'user';

	const emailId = 'admin_create_user_email';
	const passwordId = 'admin_create_user_password';
	const roleId = 'admin_create_user_role';

	const submit = () => {
		const e = email.trim();
		const p = password;
		if (!e || !p) return;
		onCreate(e, p, role);
	};
</script>

<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
	<div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c] flex items-center justify-between">
		<h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Create user</h3>
	</div>

	<div class="p-4 flex flex-col gap-3">
		{#if error}
			<div class="text-sm text-[#ffb4b4]">{error}</div>
		{/if}

		{#if created}
			<div class="text-sm text-[#b7f7c7]">
				Created: <span class="font-mono text-xs">{created.userId}</span> — {created.username} ({created.role})
			</div>
		{/if}

		<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
			<div class="flex flex-col gap-1">
				<label for={emailId} class="text-xs text-[#a8a8a8]">Email</label>
				<input
					id={emailId}
					type="email"
					bind:value={email}
					disabled={disabled || creating}
					class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4] disabled:opacity-50"
					placeholder="email@example.com"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for={passwordId} class="text-xs text-[#a8a8a8]">Password</label>
				<input
					id={passwordId}
					type="password"
					bind:value={password}
					disabled={disabled || creating}
					class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4] disabled:opacity-50"
					placeholder="min 8 chars"
					onkeydown={(e) => {
						if (e.key === 'Enter') submit();
					}}
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for={roleId} class="text-xs text-[#a8a8a8]">Role</label>
				<select
					id={roleId}
					bind:value={role}
					disabled={disabled || creating}
					class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4] disabled:opacity-50"
				>
					<option value="user">user</option>
					<option value="admin">admin</option>
				</select>
			</div>
		</div>

		<div class="flex items-center justify-end">
			<button
				type="button"
				onclick={submit}
				disabled={disabled || creating || !email.trim() || !password}
				class="px-3 py-2 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if creating}
					<LoadingDots />
				{:else}
					Create
				{/if}
			</button>
		</div>
	</div>
</div>
