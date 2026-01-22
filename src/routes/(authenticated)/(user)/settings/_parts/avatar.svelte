<script lang="ts">
	import { onMount } from 'svelte';
	import AvatarPickerCard from '../_cards/AvatarPickerCard.svelte';
	import type { UserConfigDto } from '$lib/api/settings';
	import { settingsApi } from '$lib/api/settings';
	import { profileApi } from '$lib/api/profile';
	import type { Notice } from '../utils';
	import { ensureBang, formatErrorMessage, normalizeToCloudfrontKey } from '../utils';
	import { loadOwnedAvatars, type AvatarOption } from '../avatar';

	let { config = null } = $props<{ config?: UserConfigDto | null }>();

	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;

	let ownedAvatars = $state<AvatarOption[]>([]);
	let selectedAvatarId = $state<string | null>(null);
	let currentAvatarKey = $state<string>(
		normalizeToCloudfrontKey(config?.s3AvatarUrl || '') || defaultAvatar
	);
	let avatarsLoading = $state(false);
	let saving = $state(false);
	let notice = $state<Notice | null>(null);
	let timer: ReturnType<typeof setTimeout> | null = null;

	const setNotice = (type: Notice['type'], message: string) => {
		notice = { type, message: ensureBang(message) };
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			notice = null;
		}, 3000);
	};

	const refreshProfile = async () => {
		const prof = await profileApi.getProfile(fetch);
		const avatar = (prof?.profile?.s3AvatarUrl ?? '').toString().trim();
		if (avatar) currentAvatarKey = normalizeToCloudfrontKey(avatar);
	};

	const init = async () => {
		avatarsLoading = true;
		try {
			try {
				await refreshProfile();
			} catch {}

			const res = await loadOwnedAvatars(fetch, currentAvatarKey, defaultAvatar);
			ownedAvatars = res.ownedAvatars;
			selectedAvatarId = res.selectedAvatarId;
		} catch {
			ownedAvatars = [{ id: 'default', name: 'AlgoDuck', imageUrl: defaultAvatar }];
			selectedAvatarId = 'default';
			currentAvatarKey = normalizeToCloudfrontKey(currentAvatarKey) || defaultAvatar;
		} finally {
			avatarsLoading = false;
		}
	};

	const saveAvatar = async (avatarId: string) => {
		if (!avatarId) return;
		saving = true;
		try {
			const hit = ownedAvatars.find((a) => a.id === avatarId) ?? null;
			const avatarKey = normalizeToCloudfrontKey(hit?.imageUrl || '') || defaultAvatar;

			await settingsApi.selectAvatar(avatarId, fetch);

			selectedAvatarId = avatarId;
			currentAvatarKey = avatarKey;

			try {
				window.dispatchEvent(new CustomEvent('algoduck:avatar', { detail: avatarKey }));
			} catch {}

			setNotice('success', 'Saved');
		} catch (e) {
			setNotice('error', formatErrorMessage(e, 'Could not save avatar'));
		} finally {
			saving = false;
		}
	};

	onMount(() => {
		void init();
	});
</script>

<AvatarPickerCard
	{ownedAvatars}
	{selectedAvatarId}
	currentImageUrl={currentAvatarKey}
	onSave={saveAvatar}
	disabled={avatarsLoading || saving}
	onchange={(e: CustomEvent<{ avatarId: string }>) => {
		selectedAvatarId = e.detail.avatarId;
	}}
/>

{#if notice}
	<p
		class={`mt-3 text-sm font-semibold ${
			notice.type === 'success' ? 'text-[color:var(--color-primary)]' : 'text-red-500'
		}`}
	>
		{notice.message}
	</p>
{/if}
