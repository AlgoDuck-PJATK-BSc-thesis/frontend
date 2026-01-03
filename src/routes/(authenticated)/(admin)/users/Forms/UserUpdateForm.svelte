<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	type UpdateRole = 'keep' | 'user' | 'admin';
	type UsernameMode = 'none' | 'manual' | 'generate';
	type EmailMode = 'none' | 'manual';
	type PasswordMode = 'none' | 'manual' | 'generate';

	type UpdatePayload = {
		userId: string;
		username: string | null;
		role: UpdateRole;
		email: string | null;
		password: string | null;
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
	let generatedUsernameRole = $state<'user' | 'admin' | null>(null);

	let emailMode = $state<EmailMode>('none');
	let email = $state('');

	let passwordMode = $state<PasswordMode>('none');
	let password = $state('');
	let hasGeneratedPassword = $state(false);
	let showPassword = $state(false);

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

	const targetUsernameRole = () => (role === 'admin' ? 'admin' : 'user');

	const regenerateUsername = () => {
		const r = targetUsernameRole();
		username = r === 'admin' ? generateAdminUsername() : generateUserUsername();
		generatedUsernameRole = r;
	};

	const generatePassword = (len: number) => {
		const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		const specials = '!@#$%^&*_-+=';
		const pool = alphabet + specials;

		const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
		const out: string[] = [];

		if (c?.getRandomValues) {
			const buf = new Uint32Array(len);
			c.getRandomValues(buf);
			for (let i = 0; i < len; i++) out.push(pool[buf[i] % pool.length]);
		} else {
			for (let i = 0; i < len; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
		}

		const req = [alphabet.slice(0, 26), alphabet.slice(26, 52), alphabet.slice(52, 62), specials];

		for (let i = 0; i < req.length; i++) {
			const idx = randomInt(0, out.length - 1);
			out[idx] = req[i][randomInt(0, req[i].length - 1)];
		}

		return out.join('');
	};

	const regeneratePassword = () => {
		password = generatePassword(16);
		hasGeneratedPassword = true;
	};

	$effect(() => {
		if (usernameMode !== 'generate') return;
		const r = targetUsernameRole();
		if (generatedUsernameRole === r && username) return;
		regenerateUsername();
	});

	$effect(() => {
		if (passwordMode !== 'generate') return;
		if (hasGeneratedPassword && password) return;
		regeneratePassword();
	});

	$effect(() => {
		userId = initialUserId;
	});

	const canSubmit = () => {
		if (!userId.trim()) return false;

		const wantsUsername = usernameMode !== 'none';
		const wantsRole = role !== 'keep';
		const wantsEmail = emailMode !== 'none';
		const wantsPassword = passwordMode !== 'none';

		if (!wantsUsername && !wantsRole && !wantsEmail && !wantsPassword) return false;

		if (wantsUsername && !username.trim()) return false;
		if (wantsEmail && !email.trim()) return false;
		if (wantsPassword && !password) return false;

		return true;
	};

	const submit = () => {
		if (!canSubmit()) return;

		onUpdate({
			userId: userId.trim(),
			username: usernameMode === 'none' ? null : username.trim(),
			role,
			email: emailMode === 'none' ? null : email.trim(),
			password: passwordMode === 'none' ? null : password
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
				Saved: <span class="font-mono text-xs">{success.userId}</span> — {success.username} — {success.email} ({(success.roles ?? []).join(', ')})
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
				<option value="keep">keep the same role</option>
				<option value="user">user</option>
				<option value="admin">admin</option>
			</select>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_email" class="text-xs text-[#a8a8a8]">Email</label>

			<div class="flex flex-wrap gap-2 items-center">
				<div class="flex items-center border border-[#3c3c3c] rounded-sm overflow-hidden">
					<button
						type="button"
						onclick={() => (emailMode = 'none')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${emailMode === 'none' ? 'bg-[#0e639c] text-white' : 'bg-[#1f1f1f] text-[#e7e7e7] hover:bg-[#2a2a2a]'} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						No change
					</button>
					<button
						type="button"
						onclick={() => (emailMode = 'manual')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${emailMode === 'manual' ? 'bg-[#0e639c] text-white' : 'bg-[#1f1f1f] text-[#e7e7e7] hover:bg-[#2a2a2a]'} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						Type
					</button>
				</div>

				<input
					id="admin_update_email"
					type="email"
					bind:value={email}
					readonly={emailMode !== 'manual'}
					disabled={disabled || saving || emailMode === 'none'}
					class="flex-1 min-w-[240px] bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4] disabled:opacity-50"
				/>
			</div>
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
						onclick={regenerateUsername}
						disabled={disabled || saving}
						class="px-3 py-2 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Regenerate
					</button>
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_password" class="text-xs text-[#a8a8a8]">Password</label>

			<div class="flex flex-wrap gap-2 items-center">
				<div class="flex items-center border border-[#3c3c3c] rounded-sm overflow-hidden">
					<button
						type="button"
						onclick={() => (passwordMode = 'none')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${passwordMode === 'none' ? 'bg-[#0e639c] text-white' : 'bg-[#1f1f1f] text-[#e7e7e7] hover:bg-[#2a2a2a]'} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						No change
					</button>
					<button
						type="button"
						onclick={() => (passwordMode = 'manual')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${passwordMode === 'manual' ? 'bg-[#0e639c] text-white' : 'bg-[#1f1f1f] text-[#e7e7e7] hover:bg-[#2a2a2a]'} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						Type
					</button>
					<button
						type="button"
						onclick={() => (passwordMode = 'generate')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${passwordMode === 'generate' ? 'bg-[#0e639c] text-white' : 'bg-[#1f1f1f] text-[#e7e7e7] hover:bg-[#2a2a2a]'} disabled:opacity-50 disabled:cursor-not-allowed`}
					>
						Generate
					</button>
				</div>

				<input
					id="admin_update_password"
					type={showPassword ? 'text' : 'password'}
					bind:value={password}
					readonly={passwordMode === 'generate'}
					disabled={disabled || saving || passwordMode === 'none'}
					class={`flex-1 min-w-[240px] bg-[#1f1f1f] border border-[#3c3c3c] rounded-sm px-3 py-2 text-sm text-[#e7e7e7] outline-none focus:border-[#007fd4] disabled:opacity-50 ${passwordMode === 'generate' ? 'font-mono' : ''}`}
				/>

				<button
					type="button"
					onclick={() => (showPassword = !showPassword)}
					disabled={disabled || saving || passwordMode === 'none'}
					class="px-3 py-2 bg-[#3c3c3c] text-[#e7e7e7] rounded-sm text-xs font-medium hover:bg-[#4a4a4a] disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{showPassword ? 'Hide' : 'Show'}
				</button>

				{#if passwordMode === 'generate'}
					<button
						type="button"
						onclick={regeneratePassword}
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
