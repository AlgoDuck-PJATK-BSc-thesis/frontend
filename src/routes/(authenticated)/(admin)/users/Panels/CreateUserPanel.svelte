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

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div
		class="flex items-center justify-between border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3"
	>
		<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
			Create user
		</h3>
	</div>

	<div class="flex flex-col gap-3 p-4">
		{#if error}
			<div class="text-sm text-admin-danger-text">{error}</div>
		{/if}

		{#if created}
			<div class="text-sm text-admin-accent-link">
				Created: <span class="font-mono text-xs">{created.userId}</span> — {created.username} ({created.role})
			</div>
		{/if}

		<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<div class="flex flex-col gap-1">
				<label for={emailId} class="text-xs text-admin-text-muted">Email</label>
				<input
					id={emailId}
					type="email"
					bind:value={email}
					disabled={disabled || creating}
					class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
					placeholder="email@example.com"
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for={passwordId} class="text-xs text-admin-text-muted">Password</label>
				<input
					id={passwordId}
					type="password"
					bind:value={password}
					disabled={disabled || creating}
					class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
					placeholder="min 8 chars"
					onkeydown={(e) => {
						if (e.key === 'Enter') submit();
					}}
				/>
			</div>

			<div class="flex flex-col gap-1">
				<label for={roleId} class="text-xs text-admin-text-muted">Role</label>
				<select
					id={roleId}
					bind:value={role}
					disabled={disabled || creating}
					class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
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
				class="rounded-sm bg-admin-accent-primary px-3 py-2 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
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
