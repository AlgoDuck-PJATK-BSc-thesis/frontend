<script lang="ts">
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';

	type CreateRole = 'user' | 'admin';

	type CreatePayload = {
		email: string;
		password: string;
		role: CreateRole;
		emailVerified: boolean;
		username: string | null;
	};

	type CreatedUser = {
		userId: string;
		email: string;
		username: string;
		role: string;
		emailVerified: boolean;
	};

	type Props = {
		disabled?: boolean;
		creating?: boolean;
		error?: string | null;
		created?: CreatedUser | null;
		onCreate: (payload: CreatePayload) => void;
	};

	let {
		disabled = false,
		creating = false,
		error = null,
		created = null,
		onCreate
	} = $props() as Props;

	let email = $state('');
	let role = $state<CreateRole>('user');
	let emailVerified = $state(true);

	let usernameMode = $state<'manual' | 'generate'>('generate');
	let username = $state('');
	let generatedUsernameRole = $state<CreateRole | null>(null);

	let passwordMode = $state<'manual' | 'generate'>('generate');
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

	const generateUsernameForRole = (r: CreateRole) =>
		r === 'admin' ? generateAdminUsername() : generateUserUsername();

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

	const regenerateUsername = () => {
		username = generateUsernameForRole(role);
		generatedUsernameRole = role;
	};

	const regeneratePassword = () => {
		password = generatePassword(16);
		hasGeneratedPassword = true;
	};

	$effect(() => {
		if (usernameMode !== 'generate') return;
		if (generatedUsernameRole === role && username) return;
		regenerateUsername();
	});

	$effect(() => {
		if (passwordMode !== 'generate') return;
		if (hasGeneratedPassword && password) return;
		regeneratePassword();
	});

	const canSubmit = () => {
		if (!email.trim()) return false;
		if (passwordMode === 'manual' && !password) return false;
		if (passwordMode === 'generate' && !password) return false;
		if (usernameMode === 'manual' && !username.trim()) return false;
		if (usernameMode === 'generate' && !username) return false;
		return true;
	};

	const submit = () => {
		if (!canSubmit()) return;

		const payload: CreatePayload = {
			email: email.trim(),
			password,
			role,
			emailVerified,
			username: usernameMode === 'manual' ? username.trim() : username
		};

		onCreate(payload);
	};
</script>

<div class="overflow-hidden rounded border border-admin-border-primary bg-admin-bg-secondary">
	<div class="border-b border-admin-border-primary bg-admin-bg-tertiary px-4 py-3">
		<h3 class="text-xs font-semibold tracking-wider text-admin-text-primary uppercase">
			Create user
		</h3>
	</div>

	<div class="flex flex-col gap-4 p-4">
		{#if error}
			<div class="text-sm text-admin-danger-text">{error}</div>
		{/if}

		{#if created}
			<div class="text-sm text-admin-accent-link">
				Created: <span class="font-mono text-xs">{created.userId}</span> — {created.username} ({created.role})
				— verified: {created.emailVerified ? 'yes' : 'no'}
			</div>
		{/if}

		<div class="flex flex-col gap-2">
			<label for="admin_create_email" class="text-xs text-admin-text-muted">Email</label>
			<input
				id="admin_create_email"
				type="email"
				bind:value={email}
				disabled={disabled || creating}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
			/>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_create_role" class="text-xs text-admin-text-muted">Role</label>
			<select
				id="admin_create_role"
				bind:value={role}
				disabled={disabled || creating}
				class="rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50"
			>
				<option value="user">user</option>
				<option value="admin">admin</option>
			</select>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_create_verified" class="text-xs text-admin-text-muted">Email verified</label
			>
			<div
				class="flex items-center gap-2 rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2"
			>
				<input
					id="admin_create_verified"
					type="checkbox"
					bind:checked={emailVerified}
					disabled={disabled || creating}
					class="accent-admin-accent-primary"
				/>
				<span class="text-sm text-admin-text-primary">{emailVerified ? 'true' : 'false'}</span>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<div class="flex items-center justify-between">
				<label for="admin_create_username" class="text-xs text-admin-text-muted">Username</label>
			</div>

			<div class="flex flex-wrap items-center gap-2">
				<div
					class="flex items-center overflow-hidden rounded-sm border border-admin-border-primary"
				>
					<button
						type="button"
						onclick={() => (usernameMode = 'manual')}
						disabled={disabled || creating}
						class={`px-3 py-2 text-xs font-medium ${usernameMode === 'manual' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						Type
					</button>
					<button
						type="button"
						onclick={() => (usernameMode = 'generate')}
						disabled={disabled || creating}
						class={`px-3 py-2 text-xs font-medium ${usernameMode === 'generate' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						Generate
					</button>
				</div>

				<input
					id="admin_create_username"
					type="text"
					bind:value={username}
					readonly={usernameMode === 'generate'}
					disabled={disabled || creating}
					class={`min-w-[240px] flex-1 rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50 ${usernameMode === 'generate' ? 'font-mono' : ''}`}
				/>

				{#if usernameMode === 'generate'}
					<button
						type="button"
						onclick={regenerateUsername}
						disabled={disabled || creating}
						class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
					>
						Regenerate
					</button>
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<label for="admin_create_password" class="text-xs text-admin-text-muted">Password</label>

			<div class="flex flex-wrap items-center gap-2">
				<div
					class="flex items-center overflow-hidden rounded-sm border border-admin-border-primary"
				>
					<button
						type="button"
						onclick={() => (passwordMode = 'manual')}
						disabled={disabled || creating}
						class={`px-3 py-2 text-xs font-medium ${passwordMode === 'manual' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						Type
					</button>
					<button
						type="button"
						onclick={() => (passwordMode = 'generate')}
						disabled={disabled || creating}
						class={`px-3 py-2 text-xs font-medium ${passwordMode === 'generate' ? 'bg-admin-accent-primary text-white' : 'bg-admin-bg-primary text-admin-text-primary hover:bg-admin-bg-hover'} disabled:cursor-not-allowed disabled:opacity-50`}
					>
						Generate
					</button>
				</div>

				<input
					id="admin_create_password"
					type={showPassword ? 'text' : 'password'}
					bind:value={password}
					readonly={passwordMode === 'generate'}
					disabled={disabled || creating}
					class={`min-w-[240px] flex-1 rounded-sm border border-admin-border-primary bg-admin-bg-primary px-3 py-2 text-sm text-admin-text-primary outline-none focus:border-admin-accent-primary-hover disabled:opacity-50 ${passwordMode === 'generate' ? 'font-mono' : ''}`}
				/>

				<button
					type="button"
					onclick={() => (showPassword = !showPassword)}
					disabled={disabled || creating}
					class="rounded-sm bg-admin-bg-input px-3 py-2 text-xs font-medium text-admin-text-primary hover:bg-admin-bg-hover disabled:cursor-not-allowed disabled:opacity-50"
				>
					{showPassword ? 'Hide' : 'Show'}
				</button>

				{#if passwordMode === 'generate'}
					<button
						type="button"
						onclick={regeneratePassword}
						disabled={disabled || creating}
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
				disabled={disabled || creating || !canSubmit()}
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
