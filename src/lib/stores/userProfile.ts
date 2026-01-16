import { writable, derived, get } from 'svelte/store';

export type OwnedAvatar = {
	id: string;
	name: string;
	imageUrl: string;
};

export type UserProfile = {
	avatarId: string | null;
	ownedAvatars: OwnedAvatar[];
};

const initial: UserProfile = {
	avatarId: null,
	ownedAvatars: []
};

export const userProfile = writable<UserProfile>(initial);

export const currentAvatar = derived(userProfile, ($p) => {
	const id = $p.avatarId;
	if (!id) return null;
	return $p.ownedAvatars.find((a) => a.id === id) ?? null;
});

export function setOwnedAvatars(ownedAvatars: OwnedAvatar[]) {
	userProfile.update((p) => {
		const next = { ...p, ownedAvatars };
		if (next.avatarId && !next.ownedAvatars.some((a) => a.id === next.avatarId)) {
			next.avatarId = next.ownedAvatars[0]?.id ?? null;
		}
		if (!next.avatarId && next.ownedAvatars.length) next.avatarId = next.ownedAvatars[0].id;
		return next;
	});
}

export function setAvatarId(avatarId: string) {
	userProfile.update((p) => ({ ...p, avatarId }));
}

export function getAvatarId() {
	return get(userProfile).avatarId;
}
