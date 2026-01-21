<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import BlinkingEye from '$lib/Components/Misc/BlinkingEye.svelte';

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

	let {
		disabled = false,
		saving = false,
		error = null,
		success = null,
		initialUserId = '',
		onUpdate
	} = $props() as Props;

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

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div class="border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3">
		<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
			Update user
		</h3>
	</div>

	<div class="flex flex-col gap-4 p-4">
		{#if error}
			<div class="text-sm text-admin-danger-text">{error}</div>
		{/if}

		{#if success}
			<div class="text-sm text-admin-accent-link">
				Saved: <span class="text-xs">{success.userId}</span> - {success.username} - {success.email}
				({(success.roles ?? []).join(', ')})
			</div>
		{/if}

		<div class="flex flex-col gap-2">
			<label for="admin_update_userid" class="text-xs text-admin-text-muted">User ID</label>
			<input
				id="admin_update_userid"
				type="text"
				bind:value={userId}
				disabled={disabled || saving}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
			/>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_role" class="text-xs text-admin-text-muted">Role</label>
			<select
				id="admin_update_role"
				bind:value={role}
				disabled={disabled || saving}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
			>
				<option value="keep">keep the same role</option>
				<option value="user">user</option>
				<option value="admin">admin</option>
			</select>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_email" class="text-xs text-admin-text-muted">Email</label>

			<div class="flex flex-wrap items-center gap-2">
				<div
					class="flex items-center overflow-hidden rounded-sm border border-admin-border-primary"
				>
					<button
						type="button"
						onclick={() => (emailMode = 'none')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${emailMode === 'none' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						No change
					</button>
					<button
						type="button"
						onclick={() => (emailMode = 'manual')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${emailMode === 'manual' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
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
					class="min-w-[240px] flex-1 rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
				/>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_username" class="text-xs text-admin-text-muted">Username</label>

			<div class="flex flex-wrap items-center gap-2">
				<div
					class="flex items-center overflow-hidden rounded-sm border border-admin-border-primary"
				>
					<button
						type="button"
						onclick={() => (usernameMode = 'none')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${usernameMode === 'none' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						No change
					</button>
					<button
						type="button"
						onclick={() => (usernameMode = 'manual')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${usernameMode === 'manual' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						Type
					</button>
					<button
						type="button"
						onclick={() => (usernameMode = 'generate')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${usernameMode === 'generate' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
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
					class={`min-w-[240px] flex-1 rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50 ${usernameMode === 'generate' ? '' : ''}`}
				/>

				{#if usernameMode === 'generate'}
					<button
						type="button"
						onclick={regenerateUsername}
						disabled={disabled || saving}
						class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
					>
						Regenerate
					</button>
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_update_password" class="text-xs text-admin-text-muted">Password</label>

			<div class="flex flex-wrap items-center gap-2">
				<div
					class="flex items-center overflow-hidden rounded-sm border border-admin-border-primary"
				>
					<button
						type="button"
						onclick={() => (passwordMode = 'none')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${passwordMode === 'none' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						No change
					</button>
					<button
						type="button"
						onclick={() => (passwordMode = 'manual')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${passwordMode === 'manual' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						Type
					</button>
					<button
						type="button"
						onclick={() => (passwordMode = 'generate')}
						disabled={disabled || saving}
						class={`px-3 py-2 text-xs font-medium ${passwordMode === 'generate' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
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
					class={`min-w-[240px] flex-1 rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50 ${passwordMode === 'generate' ? '' : ''}`}
				/>

				<button
					type="button"
					onclick={() => (showPassword = !showPassword)}
					disabled={disabled || saving || passwordMode === 'none'}
					aria-label={showPassword ? 'Hide password' : 'Show password'}
					class="flex h-9 w-9 items-center justify-center rounded-sm bg-admin-bg-input text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
				>
					<BlinkingEye open={showPassword} options={{ class: 'h-4 w-4' }} />
				</button>

				{#if passwordMode === 'generate'}
					<button
						type="button"
						onclick={regeneratePassword}
						disabled={disabled || saving}
						class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
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
				class="rounded-sm bg-admin-accent-primary px-3 py-2 text-xs font-medium text-white hover:bg-admin-accent-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
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
