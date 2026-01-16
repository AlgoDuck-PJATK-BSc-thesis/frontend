<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import WeeklyPicker from '$lib/Components/DurationPickers/WeeklyPicker.svelte';
	import SettingsCard from './SettingsCard.svelte';
	import AvatarPickerCard from './AvatarPickerCard.svelte';
	import type { WeeklyReminderConfig } from '$lib/types/StudyTimerTypes';
	import { profileApi } from '$lib/api/profile';
	import { authApi, type UserSessionDto } from '$lib/api/auth';
	import { settingsApi, type Reminder, type UserConfigDto } from '$lib/api/settings';
	import { userThemePreference, type ThemeName } from '$lib/stores/theme.svelte';
	import { accessibility } from '$lib/stores/accessibility.svelte';
	import { applyTheme } from '$lib/Themes';

	type PageDataShape = {
		config: UserConfigDto | null;
		user: { username: string; email: string } | null;
	};

	type Notice = { type: 'success' | 'error'; message: string };

	export let data: PageDataShape;

	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;
	const deletePhrase = 'I am sure I want to delete my account';

	const coerceString = (v: unknown) => (v ?? '').toString();
	const normalizeToCloudfrontKey = (value: string): string => {
		const v = (value ?? '').toString().trim();
		if (!v) return '';
		if (v.startsWith('http://') || v.startsWith('https://')) {
			try {
				const u = new URL(v);
				const p = (u.pathname ?? '').replace(/^\/+/, '').trim();
				return p || '';
			} catch {
				return '';
			}
		}
		return v;
	};

	const isUuid = (s: string) =>
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

	const idFromDuckKey = (key: string) => {
		const k = normalizeToCloudfrontKey(key);
		const m = k.match(/duck-([0-9a-f-]{36})\.png$/i);
		const id = (m?.[1] ?? '').toString();
		return isUuid(id) ? id : k;
	};

	type AvatarOption = {
		id: string;
		name: string;
		imageUrl: string;
	};

	type DuckItemDto = {
		itemId: string;
		name: string;
		isOwned: boolean;
	} & Record<string, unknown>;

	type PageData<T> = {
		currPage: number;
		pageSize: number;
		totalItems: number;
		nextCursor: number | null;
		prevCursor: number | null;
		items: T[];
	};

	const pickImageFromDuckItem = (i: DuckItemDto) => {
		const pick = (v: unknown) => coerceString(v).trim();
		return (
			pick(i.imageUrl) ||
			pick(i.s3ImageUrl) ||
			pick(i.previewUrl) ||
			pick(i.thumbnailUrl) ||
			pick(i.iconUrl) ||
			pick(i.spriteUrl) ||
			pick(i.url) ||
			pick(i.path) ||
			pick(i.key) ||
			''
		);
	};

	const fallbackDuckKey = (itemId: string) =>
		isUuid(itemId) ? `Ducks/Outfits/duck-${itemId}.png` : '';

	const dedupeAvatars = (list: AvatarOption[]) => {
		const seen = new Set<string>();
		const out: AvatarOption[] = [];
		for (const a of list) {
			const key = `${a.id}|${normalizeToCloudfrontKey(a.imageUrl)}`;
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(a);
		}
		return out;
	};

	const config = data.config;

	let username = config?.username ?? data.user?.username ?? '';
	let email = config?.email ?? data.user?.email ?? '';
	let newUsername = username;
	let newEmail = '';

	let theme: ThemeName = (config?.isDarkMode ?? true) ? 'dark' : 'light';
	let highContrast = !!config?.isHighContrast;
	let highContrastChoice: 'enabled' | 'disabled' = highContrast ? 'enabled' : 'disabled';

	let emailNotificationsEnabled = !!config?.emailNotificationsEnabled;
	let reminders: WeeklyReminderConfig = (config?.weeklyReminders ?? []) as WeeklyReminderConfig;
	$: hasAnyReminderEnabled = Array.isArray(reminders) && reminders.some((r: any) => !!r?.enabled);

	let saving = {
		avatar: false,
		username: false,
		email: false,
		password: false,
		twofactor: false,
		theme: false,
		contrast: false,
		reminders: false,
		sessions: false,
		danger: false
	};

	let notices: Record<keyof typeof saving, Notice | null> = {
		avatar: null,
		username: null,
		email: null,
		password: null,
		twofactor: null,
		theme: null,
		contrast: null,
		reminders: null,
		sessions: null,
		danger: null
	};

	let timers: Partial<Record<keyof typeof saving, ReturnType<typeof setTimeout>>> = {};

	const ensureBang = (s: string) => {
		const t = (s ?? '').toString().trim();
		if (!t) return '!';
		return t.endsWith('!') ? t : `${t}!`;
	};

	const setSectionNotice = (key: keyof typeof saving, type: Notice['type'], message: string) => {
		notices[key] = { type, message: ensureBang(message) };
		const t = timers[key];
		if (t) clearTimeout(t);
		timers[key] = setTimeout(() => {
			notices[key] = null;
		}, 3000);
	};

	let ownedAvatars: AvatarOption[] = [];
	let selectedAvatarId: string | null = null;
	let currentAvatarKey = normalizeToCloudfrontKey(config?.s3AvatarUrl || '') || defaultAvatar;
	let avatarsLoading = false;

	let twoFactorEnabled = false;
	let twoFactorChoice: 'enabled' | 'disabled' = 'disabled';

	let sessionsOpen = false;
	let sessionsLoading = false;
	let sessions: UserSessionDto[] = [];

	let currentPassword = '';
	let nextPassword = '';
	let nextPasswordConfirm = '';

	let deleteConfirm = '';

	const setTheme = (t: ThemeName) => {
		userThemePreference.theme = t;
		applyTheme(t);
	};

	const setHighContrast = (enabled: boolean) => {
		accessibility.contrast = enabled ? 2 : 0;
	};

	const setHighContrastSelection = (choice: 'enabled' | 'disabled') => {
		highContrastChoice = choice;
		highContrast = choice === 'enabled';
		setHighContrast(highContrast);
	};

	const buildRemindersPayload = (): Reminder[] | null => {
		if (!emailNotificationsEnabled) return null;
		if (!hasAnyReminderEnabled) return null;
		const list = Array.isArray(reminders) ? reminders : [];
		return list
			.map((r: any) => ({
				day: String(r?.day ?? '').trim(),
				enabled: !!r?.enabled,
				hour: Number(r?.hour ?? 0),
				minute: Number(r?.minute ?? 0)
			}))
			.filter((r: Reminder) => !!r.day);
	};

	const applyLocalPreferenceEffects = () => {
		setTheme(theme);
		setHighContrast(highContrast);
		highContrastChoice = highContrast ? 'enabled' : 'disabled';
	};

	const loadOwnedAvatars = async () => {
		avatarsLoading = true;
		try {
			const pageSize = 60;
			let page = 0;
			let all: DuckItemDto[] = [];
			let guard = 0;

			while (guard < 80) {
				guard += 1;

				const sp = new URLSearchParams();
				sp.set('currentPage', String(page + 1));
				sp.set('pageSize', String(pageSize));

				const res = await (
					await import('$lib/api/apiCall')
				).FetchFromApi<PageData<DuckItemDto>>('item/duck', { method: 'GET' }, fetch, sp);

				const items = Array.isArray(res.body?.items) ? res.body.items : [];
				all = all.concat(items);

				const total = Number(res.body?.totalItems ?? 0);
				if (!items.length) break;
				if (total > 0 && all.length >= total) break;
				if (items.length < pageSize) break;

				page += 1;
			}

			const owned = all.filter((i) => !!i?.isOwned);

			ownedAvatars = owned
				.map((i) => {
					const id = coerceString(i.itemId).trim();
					const name = coerceString(i.name).trim() || 'Duck';
					const img = normalizeToCloudfrontKey(pickImageFromDuckItem(i));
					const imageUrl = img || fallbackDuckKey(id);
					return { id, name, imageUrl };
				})
				.filter((a) => !!a.id);

			const currentNorm = normalizeToCloudfrontKey(currentAvatarKey);
			const defaultNorm = normalizeToCloudfrontKey(defaultAvatar);

			if (!ownedAvatars.some((a) => normalizeToCloudfrontKey(a.imageUrl) === defaultNorm)) {
				ownedAvatars = [
					{ id: idFromDuckKey(defaultAvatar), name: 'AlgoDuck', imageUrl: defaultAvatar },
					...ownedAvatars
				];
			}

			if (
				currentNorm &&
				currentNorm !== defaultNorm &&
				!ownedAvatars.some((a) => normalizeToCloudfrontKey(a.imageUrl) === currentNorm)
			) {
				ownedAvatars = [
					{ id: idFromDuckKey(currentNorm), name: 'Current avatar', imageUrl: currentNorm },
					...ownedAvatars
				];
			}

			ownedAvatars = dedupeAvatars(ownedAvatars);

			const hit = currentNorm
				? (ownedAvatars.find((a) => normalizeToCloudfrontKey(a.imageUrl) === currentNorm) ?? null)
				: null;

			selectedAvatarId =
				hit?.id ?? (currentNorm ? idFromDuckKey(currentNorm) : (ownedAvatars[0]?.id ?? null));
		} finally {
			avatarsLoading = false;
		}
	};

	const refreshProfile = async () => {
		const prof = await profileApi.getProfile(fetch);
		const avatar = coerceString(prof?.profile?.s3AvatarUrl).trim();
		if (avatar) currentAvatarKey = normalizeToCloudfrontKey(avatar);
		const u = coerceString(prof?.profile?.username).trim();
		const e = coerceString(prof?.profile?.email).trim();
		if (u) {
			username = u;
			newUsername = u;
		}
		if (e) email = e;
		twoFactorEnabled = !!prof?.profile?.twoFactorEnabled;
		twoFactorChoice = twoFactorEnabled ? 'enabled' : 'disabled';
	};

	const loadSessions = async () => {
		sessionsLoading = true;
		try {
			const list = await authApi.getSessions(fetch);
			sessions = Array.isArray(list) ? list : [];
			sessions = sessions.sort((a, b) => (a.isCurrent === b.isCurrent ? 0 : a.isCurrent ? -1 : 1));
		} finally {
			sessionsLoading = false;
		}
	};

	const init = async () => {
		try {
			applyLocalPreferenceEffects();
		} catch {}

		try {
			await refreshProfile();
		} catch {}

		try {
			await loadOwnedAvatars();
		} catch {
			ownedAvatars = [
				{ id: idFromDuckKey(defaultAvatar), name: 'AlgoDuck', imageUrl: defaultAvatar }
			];
			selectedAvatarId = idFromDuckKey(currentAvatarKey || defaultAvatar);
		}

		try {
			await loadSessions();
		} catch {
			sessions = [];
		}
	};

	const saveAvatar = async (avatarId: string) => {
		if (!avatarId) return;

		saving.avatar = true;
		try {
			const hit = ownedAvatars.find((a) => a.id === avatarId) ?? null;
			const avatarKey =
				normalizeToCloudfrontKey(hit?.imageUrl || '') || fallbackDuckKey(avatarId) || defaultAvatar;

			await settingsApi.selectAvatar(avatarId, fetch);

			selectedAvatarId = avatarId;
			currentAvatarKey = avatarKey;

			try {
				window.dispatchEvent(new CustomEvent('algoduck:avatar', { detail: avatarKey }));
			} catch {}

			setSectionNotice('avatar', 'success', 'Saved');
		} catch (e) {
			setSectionNotice('avatar', 'error', e instanceof Error ? e.message : 'Could not save avatar');
		} finally {
			saving.avatar = false;
		}
	};

	const saveUsername = async () => {
		const clean = newUsername.trim();
		if (!clean) {
			setSectionNotice('username', 'error', 'Username cannot be empty');
			return;
		}

		saving.username = true;
		try {
			await settingsApi.updateUsername({ newUserName: clean }, fetch);
			await refreshProfile();
			setSectionNotice('username', 'success', 'Saved');
		} catch (e) {
			setSectionNotice(
				'username',
				'error',
				e instanceof Error ? e.message : 'Could not save username'
			);
		} finally {
			saving.username = false;
		}
	};

	const sendEmailChange = async () => {
		const clean = newEmail.trim();
		if (!clean) {
			setSectionNotice('email', 'error', 'Enter a new email');
			return;
		}

		saving.email = true;
		try {
			await authApi.changeEmailStart({ newEmail: clean }, fetch);
			setSectionNotice('email', 'success', 'Verification email sent');
			newEmail = '';
		} catch (e) {
			setSectionNotice(
				'email',
				'error',
				e instanceof Error ? e.message : 'Could not send verification email'
			);
		} finally {
			saving.email = false;
		}
	};

	const savePassword = async () => {
		if (!currentPassword || !nextPassword || !nextPasswordConfirm) {
			setSectionNotice('password', 'error', 'Fill all password fields');
			return;
		}
		if (nextPassword !== nextPasswordConfirm) {
			setSectionNotice('password', 'error', 'Passwords do not match');
			return;
		}

		saving.password = true;
		try {
			await settingsApi.changePassword({ currentPassword, newPassword: nextPassword }, fetch);
			currentPassword = '';
			nextPassword = '';
			nextPasswordConfirm = '';
			setSectionNotice('password', 'success', 'Saved');
		} catch (e) {
			setSectionNotice(
				'password',
				'error',
				e instanceof Error ? e.message : 'Could not change password'
			);
		} finally {
			saving.password = false;
		}
	};

	const saveTwoFactor = async () => {
		saving.twofactor = true;
		try {
			const wantEnabled = twoFactorChoice === 'enabled';
			if (wantEnabled !== twoFactorEnabled) {
				if (wantEnabled) {
					await authApi.enableTwoFactor(fetch);
				} else {
					await authApi.disableTwoFactor(fetch);
				}
			}
			await refreshProfile();
			setSectionNotice('twofactor', 'success', 'Saved');
		} catch (e) {
			setSectionNotice(
				'twofactor',
				'error',
				e instanceof Error ? e.message : 'Could not update 2FA'
			);
		} finally {
			saving.twofactor = false;
		}
	};

	const saveTheme = async () => {
		saving.theme = true;
		try {
			await settingsApi.updatePreferences(
				{
					isDarkMode: theme === 'dark',
					isHighContrast: highContrast,
					emailNotificationsEnabled,
					weeklyReminders: buildRemindersPayload()
				},
				fetch
			);
			applyLocalPreferenceEffects();
			setSectionNotice('theme', 'success', 'Saved');
		} catch (e) {
			setSectionNotice('theme', 'error', e instanceof Error ? e.message : 'Could not save theme');
		} finally {
			saving.theme = false;
		}
	};

	const saveContrast = async () => {
		saving.contrast = true;
		try {
			await settingsApi.updatePreferences(
				{
					isDarkMode: theme === 'dark',
					isHighContrast: highContrast,
					emailNotificationsEnabled,
					weeklyReminders: buildRemindersPayload()
				},
				fetch
			);
			applyLocalPreferenceEffects();
			setSectionNotice('contrast', 'success', 'Saved');
		} catch (e) {
			setSectionNotice(
				'contrast',
				'error',
				e instanceof Error ? e.message : 'Could not save contrast'
			);
		} finally {
			saving.contrast = false;
		}
	};

	const saveReminders = async () => {
		saving.reminders = true;
		try {
			await settingsApi.updatePreferences(
				{
					isDarkMode: theme === 'dark',
					isHighContrast: highContrast,
					emailNotificationsEnabled,
					weeklyReminders: buildRemindersPayload()
				},
				fetch
			);
			setSectionNotice('reminders', 'success', 'Saved');
		} catch (e) {
			setSectionNotice(
				'reminders',
				'error',
				e instanceof Error ? e.message : 'Could not save reminders'
			);
		} finally {
			saving.reminders = false;
		}
	};

	const revokeSession = async (sessionId: string) => {
		if (!sessionId) return;
		saving.sessions = true;
		try {
			await authApi.revokeSession({ sessionId }, fetch);
			await loadSessions();
			setSectionNotice('sessions', 'success', 'Session revoked');
		} catch (e) {
			setSectionNotice(
				'sessions',
				'error',
				e instanceof Error ? e.message : 'Could not revoke session'
			);
		} finally {
			saving.sessions = false;
		}
	};

	const revokeOtherSessions = async () => {
		saving.sessions = true;
		try {
			const current = sessions.find((s) => !!s.isCurrent)?.sessionId ?? null;
			try {
				await authApi.revokeOtherSessions({}, fetch);
			} catch {
				await authApi.revokeOtherSessions({ currentSessionId: current, sessionId: current }, fetch);
			}
			await loadSessions();
			setSectionNotice('sessions', 'success', 'Other sessions revoked');
		} catch (e) {
			setSectionNotice(
				'sessions',
				'error',
				e instanceof Error ? e.message : 'Could not revoke other sessions'
			);
		} finally {
			saving.sessions = false;
		}
	};

	const deleteAccount = async () => {
		if (deleteConfirm.trim() !== deletePhrase) {
			setSectionNotice('danger', 'error', 'Type the confirmation text exactly');
			return;
		}

		saving.danger = true;
		try {
			await settingsApi.deleteAccount(fetch);
			try {
				await authApi.logout(fetch);
			} catch {}
			await goto('/');
		} catch (e) {
			setSectionNotice(
				'danger',
				'error',
				e instanceof Error ? e.message : 'Could not delete account'
			);
		} finally {
			saving.danger = false;
		}
	};

	const logout = async () => {
		const confirmed = confirm('Are you sure you want to log out?');
		if (!confirmed) return;
		try {
			await authApi.logout(fetch);
		} catch {}
		await goto('/');
	};

	onMount(() => {
		void init();
	});
</script>

<svelte:head>
	<title>Settings - AlgoDuck</title>
</svelte:head>

<section class="mt-2 flex h-[calc(100vh-5rem)] justify-center overflow-hidden px-6 pt-7">
	<div class="flex h-full w-full max-w-2xl flex-col gap-5 overflow-y-auto pb-8">
		<div class="text-center">
			<h2
				class="ocr-outline ocr-title isolate mt-2 mb-12 ml-2 [font-family:var(--font-ariw9500)] text-6xl font-semibold tracking-widest text-[var(--color-landingpage-title)]"
			>
				Settings
			</h2>

			<div id="avatar" class="w-full">
				<AvatarPickerCard
					{ownedAvatars}
					{selectedAvatarId}
					currentImageUrl={currentAvatarKey}
					onSave={saveAvatar}
					disabled={avatarsLoading}
					on:change={(e) => {
						selectedAvatarId = e.detail.avatarId;
					}}
				/>
				{#if notices.avatar}
					<p
						class={`mt-3 text-sm font-semibold ${notices.avatar.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
					>
						{notices.avatar.message}
					</p>
				{/if}
			</div>
		</div>

		<SettingsCard
			id="username"
			title="Username"
			className="mt-5 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
		>
			<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Change your username.
			</p>

			<label
				class="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>Username</span>
				<input
					bind:value={newUsername}
					class="font-body w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
				/>
			</label>

			<div class="mt-4">
				<div class={saving.username ? 'pointer-events-none opacity-60' : ''}>
					<Button
						size="small"
						label={saving.username ? 'Saving' : 'Save'}
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={saveUsername}
					/>
				</div>
				{#if notices.username}
					<p
						class={`mt-3 text-sm font-semibold ${notices.username.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
					>
						{notices.username.message}
					</p>
				{/if}
			</div>
		</SettingsCard>

		<SettingsCard
			id="email"
			title="Email"
			className="bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
		>
			<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Change your email address. You will receive a verification email.
			</p>

			<div class="text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]">
				<p class="opacity-70">Current email</p>
				<p class="mt-1 break-all">{email}</p>
			</div>

			<label
				class="mt-4 flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>New email</span>
				<input
					bind:value={newEmail}
					class="font-body w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
				/>
			</label>

			<div class="mt-4">
				<div class={saving.email ? 'pointer-events-none opacity-60' : ''}>
					<Button
						size="bigger"
						label={saving.email ? 'Sending' : 'Send verification'}
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={sendEmailChange}
					/>
				</div>
				{#if notices.email}
					<p
						class={`mt-3 text-sm font-semibold ${notices.email.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
					>
						{notices.email.message}
					</p>
				{/if}
			</div>
		</SettingsCard>

		<SettingsCard
			id="security"
			title="Password"
			className="bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
		>
			<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Change your password.
			</p>

			<div class="grid gap-4">
				<label
					class="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
				>
					<span>Current password</span>
					<input
						type="password"
						bind:value={currentPassword}
						class="font-body w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
					/>
				</label>

				<label
					class="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
				>
					<span>New password</span>
					<input
						type="password"
						bind:value={nextPassword}
						class="font-body w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
					/>
				</label>

				<label
					class="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
				>
					<span>Confirm new password</span>
					<input
						type="password"
						bind:value={nextPasswordConfirm}
						class="font-body w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
					/>
				</label>

				<div class={saving.password ? 'pointer-events-none opacity-60' : ''}>
					<Button
						size="small"
						label={saving.password ? 'Saving' : 'Save'}
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={savePassword}
					/>
				</div>

				{#if notices.password}
					<p
						class={`mt-1 text-sm font-semibold ${notices.password.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
					>
						{notices.password.message}
					</p>
				{/if}
			</div>
		</SettingsCard>

		<SettingsCard
			id="twofactor"
			title="Two-factor authentication"
			className="bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))]"
		>
			<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Two-factor authentication is currently {twoFactorEnabled ? 'enabled' : 'disabled'}.
			</p>

			<div
				class="flex items-center justify-between gap-4 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>Status</span>
				<div class="flex items-center gap-6">
					<label class="flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							name="twofactor"
							value="enabled"
							bind:group={twoFactorChoice}
							class="peer hidden"
						/>
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
						></div>
						On
					</label>
					<label class="flex cursor-pointer items-center gap-2">
						<input
							type="radio"
							name="twofactor"
							value="disabled"
							bind:group={twoFactorChoice}
							class="peer hidden"
						/>
						<div
							class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
						></div>
						Off
					</label>
				</div>
			</div>

			<div class="mt-6">
				<div class={saving.twofactor ? 'pointer-events-none opacity-60' : ''}>
					<Button
						size="small"
						label={saving.twofactor ? 'Saving' : 'Save'}
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={saveTwoFactor}
					/>
				</div>
				{#if notices.twofactor}
					<p
						class={`mt-3 text-sm font-semibold ${notices.twofactor.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
					>
						{notices.twofactor.message}
					</p>
				{/if}
			</div>
		</SettingsCard>

		<SettingsCard
			id="preferences"
			title="Preferences"
			className="bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))]"
		>
			<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Theme and accessibility.
			</p>

			<div
				class="flex flex-col gap-8 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
			>
				<div class="flex flex-col gap-2">
					<span>Theme</span>
					<div class="flex gap-4">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="theme"
								value="dark"
								bind:group={theme}
								class="peer hidden"
								on:change={() => setTheme('dark')}
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Dark
						</label>

						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="theme"
								value="light"
								bind:group={theme}
								class="peer hidden"
								on:change={() => setTheme('light')}
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Light
						</label>
					</div>

					<div class={`mt-4 ${saving.theme ? 'pointer-events-none opacity-60' : ''}`}>
						<Button
							size="small"
							label={saving.theme ? 'Saving' : 'Save'}
							labelFontFamily="var(--font-ariw9500)"
							labelColor="rgba(0,0,0,0.7)"
							labelFontSize="1.2rem"
							labelFontWeight="normal"
							labelTracking="normal"
							labelClass=""
							onclick={saveTheme}
						/>
					</div>
					{#if notices.theme}
						<p
							class={`mt-3 text-sm font-semibold ${notices.theme.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
						>
							{notices.theme.message}
						</p>
					{/if}
				</div>

				<div class="flex flex-col gap-2">
					<span>High contrast</span>
					<div class="flex gap-4">
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="contrast"
								value="enabled"
								bind:group={highContrastChoice}
								class="peer hidden"
								on:change={() => setHighContrastSelection('enabled')}
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							On
						</label>

						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="radio"
								name="contrast"
								value="disabled"
								bind:group={highContrastChoice}
								class="peer hidden"
								on:change={() => setHighContrastSelection('disabled')}
							/>
							<div
								class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-[color:var(--color-primary)] bg-[color:var(--color-accent-3)] after:h-2 after:w-2 after:rounded-full after:bg-[color:var(--color-accent-3)] after:content-[''] peer-checked:after:bg-[color:var(--color-primary)]"
							></div>
							Off
						</label>
					</div>

					<div class={`mt-4 ${saving.contrast ? 'pointer-events-none opacity-60' : ''}`}>
						<Button
							size="small"
							label={saving.contrast ? 'Saving' : 'Save'}
							labelFontFamily="var(--font-ariw9500)"
							labelColor="rgba(0,0,0,0.7)"
							labelFontSize="1.2rem"
							labelFontWeight="normal"
							labelTracking="normal"
							labelClass=""
							onclick={saveContrast}
						/>
					</div>
					{#if notices.contrast}
						<p
							class={`mt-3 text-sm font-semibold ${notices.contrast.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
						>
							{notices.contrast.message}
						</p>
					{/if}
				</div>
			</div>
		</SettingsCard>

		<SettingsCard
			id="reminder"
			title="Study reminders"
			className="border-2 border-[color:var(--color-accent-4)] bg-[color:var(--color-accent-4)]"
		>
			<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Choose on which days and at what hour you want a reminder email.
			</p>

			<div
				class="mb-4 flex items-center justify-between gap-4 text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
			>
				<span>Email reminders</span>
				<input
					type="checkbox"
					bind:checked={emailNotificationsEnabled}
					class="h-5 w-5 cursor-pointer appearance-none rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)]"
					style:background-color={emailNotificationsEnabled
						? 'var(--color-primary)'
						: 'var(--color-accent-3)'}
				/>
			</div>

			<div class={emailNotificationsEnabled ? '' : 'pointer-events-none opacity-50'}>
				<WeeklyPicker
					value={reminders}
					onChange={(config) => {
						reminders = config;
					}}
				/>

				{#if emailNotificationsEnabled && !hasAnyReminderEnabled}
					<p class="mt-4 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
						Default: every two weeks on Monday at 08:00.
					</p>
				{/if}
			</div>

			<div class="mt-6 flex justify-start">
				<div class={saving.reminders ? 'pointer-events-none opacity-60' : ''}>
					<Button
						size="small"
						label={saving.reminders ? 'Saving' : 'Save'}
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={saveReminders}
					/>
				</div>
			</div>

			{#if notices.reminders}
				<p
					class={`mt-3 text-sm font-semibold ${notices.reminders.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
				>
					{notices.reminders.message}
				</p>
			{/if}
		</SettingsCard>

		<SettingsCard
			id="sessions"
			title="Sessions"
			className="bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
		>
			<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Manage active sessions. This list is collapsed by default.
			</p>

			<details
				bind:open={sessionsOpen}
				class="rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-3"
			>
				<summary
					class="cursor-pointer text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
				>
					{sessionsOpen ? 'Hide sessions' : 'Show sessions'}
				</summary>

				<div class="mt-4 flex flex-col gap-3">
					{#if sessionsLoading}
						<p class="text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
							Loading...
						</p>
					{:else if !sessions.length}
						<p class="text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
							No sessions found.
						</p>
					{:else}
						{#each sessions as s (s.sessionId)}
							<div class="flex items-center justify-between gap-4">
								<div class="flex flex-col">
									<span
										class="text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
									>
										{s.isCurrent ? 'Current session' : 'Session'}
									</span>
									<span class="text-xs text-[color:var(--color-landingpage-subtitle)] opacity-70">
										Last used: {s.lastUsedAt}
									</span>
									<span class="text-xs text-[color:var(--color-landingpage-subtitle)] opacity-70">
										IP: {s.ipAddress ?? '-'}
									</span>
								</div>
								{#if !s.isCurrent}
									<div class={saving.sessions ? 'pointer-events-none opacity-60' : ''}>
										<Button
											size="small"
											label="Revoke"
											labelFontFamily="var(--font-ariw9500)"
											labelColor="rgba(0,0,0,0.7)"
											labelFontSize="1.2rem"
											labelFontWeight="normal"
											labelTracking="normal"
											labelClass=""
											onclick={() => revokeSession(s.sessionId)}
										/>
									</div>
								{/if}
							</div>
						{/each}
					{/if}

					<div class="mt-2 flex justify-start">
						<div class={saving.sessions ? 'pointer-events-none opacity-60' : ''}>
							<Button
								size="bigger"
								label={saving.sessions ? 'Revoking' : 'Revoke all other sessions'}
								labelFontFamily="var(--font-ariw9500)"
								labelColor="rgba(0,0,0,0.7)"
								labelFontSize="1.2rem"
								labelFontWeight="normal"
								labelTracking="normal"
								labelClass=""
								onclick={revokeOtherSessions}
							/>
						</div>
					</div>

					{#if notices.sessions}
						<p
							class={`mt-3 text-sm font-semibold ${notices.sessions.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
						>
							{notices.sessions.message}
						</p>
					{/if}
				</div>
			</details>
		</SettingsCard>

		<SettingsCard
			id="danger"
			title="Danger zone"
			className="bg-[linear-gradient(to_bottom,var(--color-accent-4),var(--color-accent-3))]"
		>
			<p class="mt-2 mb-6 text-sm text-[color:var(--color-landingpage-subtitle)] opacity-70">
				Deleting your account is irreversible.
			</p>

			<p class="text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]">
				Type the following text to confirm:
			</p>
			<p class="mt-2 text-sm font-semibold break-all text-[color:var(--color-primary)]">
				{deletePhrase}
			</p>

			<input
				bind:value={deleteConfirm}
				class="font-body mt-4 w-full rounded-xl border-2 border-[color:var(--color-accent-1)] bg-[color:var(--color-accent-3)] p-2 text-sm text-[color:var(--color-landingpage-subtitle)]"
			/>

			<div class="mt-4">
				<div class={saving.danger ? 'pointer-events-none opacity-60' : ''}>
					<Button
						size="bigger"
						label={saving.danger ? 'Deleting' : 'Delete account'}
						labelFontFamily="var(--font-ariw9500)"
						labelColor="rgba(0,0,0,0.7)"
						labelFontSize="1.2rem"
						labelFontWeight="normal"
						labelTracking="normal"
						labelClass=""
						onclick={deleteAccount}
					/>
				</div>
				{#if notices.danger}
					<p
						class={`mt-3 text-sm font-semibold ${notices.danger.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'}`}
					>
						{notices.danger.message}
					</p>
				{/if}
			</div>
		</SettingsCard>

		<div class="mt-2 flex w-full items-center justify-center gap-20 pb-2">
			<Button
				size="medium"
				label="Log Out"
				labelFontFamily="var(--font-ariw9500)"
				labelColor="rgba(0,0,0,0.7)"
				labelFontSize="1.2rem"
				labelFontWeight="normal"
				labelTracking="normal"
				labelClass=""
				onclick={logout}
			/>
		</div>
	</div>
</section>
