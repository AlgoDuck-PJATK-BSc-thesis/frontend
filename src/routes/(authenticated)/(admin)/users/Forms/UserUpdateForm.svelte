<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	type UpdateRole = 'keep' | 'user' | 'admin';
	type UsernameMode = 'none' | 'manual' | 'generate';

	type UpdatePayload = {
		userId: string;
		username: string | null;
		role: UpdateRole;
	};

	type UpdateSuccess = {
		userId: string;
		email: string;
		username: string;
		roles: string[];
	};

	type Props = {
		disabled?: boolean;
		saving?: boolean;
		error?: string | null;
		success?: UpdateSuccess | null;
		initialUserId?: string;
		onUpdate: (payload: UpdatePayload) => void;
	};

	let { disabled = false, saving = false, error = null, success = null, initialUserId = '', onUpdate } = $props() as Props;

	let userId = $state(initialUserId);
	let role = $state<UpdateRole>('keep');

	let usernameMode = $state<UsernameMode>('none');
	let username = $state('');
	let generatedOnce = $state(false);

	const adjectives = [
		'calm',
		'brave',
		'quiet',
		'swift',
		'bright',
		'gentle',
		'steady',
		'clever',
		'kind',
		'smooth',
		'cool',
		'plain',
		'wild',
		'patient',
		'soft'
	];

	const animals = [
		'yak',
		'otter',
		'fox',
		'owl',
		'lynx',
		'wolf',
		'koala',
		'panda',
		'tiger',
		'whale',
		'seal',
		'crow',
		'heron',
		'camel',
		'badger'
	];

	const randomInt = (min: number, max: number) => {
		const range = max - min + 1;
		const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
		if (c?.getRandomValues) {
			const buf = new Uint32Array(1);
			c.getRandomValues(buf);
			return min + (buf[0] % range);
		}
		return min + Math.floor(Math.random() * range);
	};

	const pick = <T,>(arr: T[]) => arr[randomInt(0, arr.length - 1)];

	const generateUserUsername = () => {
		const a = pick(adjectives);
		const b = pick(animals);
		const n = randomInt(1000, 9999);
		return `${a}_${b}_${n}`;
	};

	const generateAdminUsername = () => {
		const n = randomInt(1000, 9999);
		return `admin_${n}`;
	};

	const generateUsername = (nextRole: UpdateRole) => (nextRole === 'admin' ? generateAdminUsername() : generateUserUsername());

	const regenerate = () => {
		username = generateUsername(role === 'keep' ? 'user' : role);
		generatedOnce = true;
	};

	$effect(() => {
		if (usernameMode !== 'generate') return;
		if (generatedOnce && username) return;
		regenerate();
	});

	$effect(() => {
		userId = initialUserId;
	});

	const canSubmit = () => {
		if (!userId.trim()) return false;
		const wantsUsername = usernameMode !== 'none';
		if (wantsUsername && !username.trim()) return false;
		if (!wantsUsername && role === 'keep') return false;
		return true;
	};

	const submit = () => {
		if (!canSubmit()) return;

		onUpdate({
			userId: userId.trim(),
			username: usernameMode === 'none' ? null : username.trim(),
			role
		});
	};
</script>

<div class="bg-[#252526] border border-[#3c3c3c] rounded overflow-hidden">
	<div class="px-4 py-3 bg-[#2d2d2d] border-b border-[#3c3c3c]">
		<h3 class="text-xs font-semibold text-[#e7e7e7] uppercase tracking-wider">Update user</h3>
	</div>

	<div class="p-4 flex flex-col gap-4">
		{#if error}
			<div class="text-sm text-[#ffb4b4]">{error}</div>
		{/if}

		{#if success}
			<div class="text-sm text-[#b7f7c7]">
				Saved: <span class="font-mono text-xs">{success.userId}</span> — {success.username} ({(success.roles ?? []).join(', ')})
			</div>
		{/if}

		<div class="flex flex-col gap-2">
			<label for="admin_update_userid" class="text-xs text-[#a8a8a8]">User ID</label>
			<input
				id="admin_update_userid"
				type="text"
				bind:value={userId}
				disabled={disabled || saving}
				class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] font-mono outline-none focus:border-[#007fd4] disabled:opacity-50"
			/>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_role" class="text-xs text-[#a8a8a8]">Role</label>
			<select
				id="admin_update_role"
				bind:value={role}
				disabled={disabled || saving}
				class="bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4] disabled:opacity-50"
			>
				<option value="keep">keep</option>
				<option value="user">user</option>
				<option value="admin">admin</option>
			</select>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_username" class="text-xs text-[#a8a8a8]">Username</label>

			<div class="flex flex-wrap gap-2 items-center">
				<div class="flex items-center border border-[#3c3c3c] rounded-sm overflow-hidden">
					<button
						type="button"
						onclick={() => (usernameMode = 'none')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${usernameMode === 'none' ? 'bg-[#0e639c] text-white' : 'bg-[#1f1f1f] text-[#e7e7e7] hover:bg-[#2a2a2a]'} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						No change
					</button>
					<button
						type="button"
						onclick={() => (usernameMode = 'manual')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${usernameMode === 'manual' ? 'bg-[#0e639c] text-white' : 'bg-[#1f1f1f] text-[#e7e7e7] hover:bg-[#2a2a2a]'} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						Type
					</button>
					<button
						type="button"
						onclick={() => (usernameMode = 'generate')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${usernameMode === 'generate' ? 'bg-[#0e639c] text-white' : 'bg-[#1f1f1f] text-[#e7e7e7] hover:bg-[#2a2a2a]'} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						Generate
					</button>
				</div>

				<input
					id="admin_update_username"
					type="text"
					bind:value={username}
					readonly={usernameMode !== 'manual'}
					disabled={disabled || saving || usernameMode === 'none'}
					class={`flex-1 min-w-[240px] bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4] disabled:opacity-50 ${usernameMode === 'generate' ? 'font-mono' : ''}`}
				/>

				{#if usernameMode === 'generate'}
					<button
						type="button"
						onclick={regenerate}
						disabled={disabled || saving}
						class="px-3 py-2 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Regenerate
					</button>
				{/if}
			</div>
		</div>

		<div class="flex items-center justify-end">
			<button
				type="button"
				onclick={submit}
				disabled={disabled || saving || !canSubmit()}
				class="px-3 py-2 bg-[#0e639c] text-white rounded-sm text-xs font-medium hover:bg-[#1177bb] disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if saving}
					<LoadingDots />
				{:else}
					Update
				{/if}
			</button>
		</div>
	</div>
</div>
