<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';

	type AvatarOption = {
		id: string;
		name: string;
		imageUrl: string;
	};

	let {
		ownedAvatars = [],
		selectedAvatarId = null,
		currentImageUrl = null,
		onSave,
		disabled = false,
		onchange
	} = $props<{
		ownedAvatars?: AvatarOption[];
		selectedAvatarId?: string | null;
		currentImageUrl?: string | null;
		onSave?: (avatarId: string) => Promise<void> | void;
		disabled?: boolean;
		onchange?: (e: CustomEvent<{ avatarId: string }>) => void;
	}>();

	const dispatch = createEventDispatcher<{ change: { avatarId: string } }>();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let tempSelectedId = $state<string | null>(null);
	let saving = $state(false);
	let errorMsg = $state('');

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

	const eachKey = (a: AvatarOption) => `${a.id}|${normalizeToCloudfrontKey(a.imageUrl)}`;

	let selected = $derived.by(() => {
		if (!selectedAvatarId) return null;
		return ownedAvatars.find((a: AvatarOption) => a.id === selectedAvatarId) ?? null;
	});

	let displayKey = $derived.by(() => {
		return (
			normalizeToCloudfrontKey(selected?.imageUrl || '') ||
			normalizeToCloudfrontKey(currentImageUrl || '') ||
			''
		);
	});

	function openModal() {
		if (disabled) return;

		errorMsg = '';

		const currentKey = normalizeToCloudfrontKey(currentImageUrl || '');
		const matchByKey = currentKey
			? (ownedAvatars.find(
					(a: AvatarOption) => normalizeToCloudfrontKey(a.imageUrl) === currentKey
				) ?? null)
			: null;

		tempSelectedId = selectedAvatarId ?? matchByKey?.id ?? ownedAvatars[0]?.id ?? null;
		dialogEl?.showModal();
	}

	function closeModal() {
		errorMsg = '';
		dialogEl?.close();
	}

	function pick(id: string) {
		tempSelectedId = id;
	}

	async function confirm() {
		if (!tempSelectedId || saving) return;
		saving = true;
		errorMsg = '';
		try {
			await onSave?.(tempSelectedId);
			dispatch('change', { avatarId: tempSelectedId });
			onchange?.(
				new CustomEvent<{ avatarId: string }>('change', { detail: { avatarId: tempSelectedId } })
			);
			closeModal();
		} catch (e: any) {
			errorMsg = (e?.message ?? 'Could not update avatar.').toString();
		} finally {
			saving = false;
		}
	}

	function onDialogClick(e: MouseEvent) {
		if (e.target === dialogEl) closeModal();
	}
</script>

<section class="grid w-full place-items-center">
	<button
		type="button"
		class="group grid place-items-center gap-3 rounded-2xl px-3 py-2"
		onclick={openModal}
		{disabled}
		aria-haspopup="dialog"
	>
		<div
			class="h-40 w-40 overflow-hidden rounded-full border-6 border-[color:var(--color-landingpage-subtitle)] bg-[color:var(--color-primary)]"
		>
			{#if displayKey}
				<CloudfrontImage
					path={displayKey}
					cls="h-full w-full -translate-x-[-0%] -translate-y-[2%] scale-[1.2] object-cover object-[left_top]"
				/>
			{:else}
				<div
					class="grid h-full w-full place-items-center text-[color:var(--color-landingpage-subtitle)] opacity-70"
				>
					?
				</div>
			{/if}
		</div>

		<div
			class="text-sm font-semibold text-[color:var(--color-landingpage-subtitle)] group-hover:text-[color:var(--color-primary)]"
		>
			Change avatar
		</div>
	</button>

	<dialog
		bind:this={dialogEl}
		class="fixed top-1/2 left-1/2 m-0 w-[min(900px,calc(100vw-24px))] max-w-none -translate-x-1/2 -translate-y-1/2 bg-transparent p-0"
		onclick={onDialogClick}
	>
		<div
			class="max-h-[calc(100vh-24px)] w-full overflow-y-auto rounded-2xl border-2 border-[color:var(--color-accent-4)] bg-[color:var(--color-accent-3)] p-4 text-[color:var(--color-landingpage-subtitle)]"
		>
			<div class="mb-3 flex items-center justify-between gap-3">
				<div class="text-base font-bold">Choose your avatar</div>
				<button
					type="button"
					class="grid h-10 w-10 place-items-center rounded-xl border-2 border-[color:var(--color-accent-4)] bg-[color:var(--color-accent-4)] text-[color:var(--color-landingpage-subtitle)]"
					onclick={closeModal}
					aria-label="Close"
				>
					x
				</button>
			</div>

			{#if ownedAvatars.length}
				<ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{#each ownedAvatars as a (eachKey(a))}
						<li>
							<button
								type="button"
								class={`w-full rounded-2xl bg-[color:var(--color-accent-4)] p-2 text-left ${
									a.id === tempSelectedId
										? 'border-4 border-[color:var(--color-primary)]'
										: 'border-2 border-[color:var(--color-accent-4)]'
								}`}
								onclick={() => pick(a.id)}
								aria-pressed={a.id === tempSelectedId}
							>
								<div
									class="aspect-square w-full overflow-hidden rounded-xl bg-[color:var(--color-accent-4)]"
								>
									{#if normalizeToCloudfrontKey(a.imageUrl)}
										<CloudfrontImage
											path={normalizeToCloudfrontKey(a.imageUrl)}
											cls="h-full w-full object-cover"
										/>
									{:else}
										<div
											class="grid h-full w-full place-items-center text-[color:var(--color-landingpage-subtitle)] opacity-70"
										>
											?
										</div>
									{/if}
								</div>
								<div
									class="mt-2 truncate text-sm font-semibold text-[color:var(--color-landingpage-subtitle)]"
								>
									{a.name}
								</div>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<div
					class="rounded-2xl border-2 border-[color:var(--color-accent-4)] bg-[color:var(--color-accent-4)] p-4 opacity-80"
				>
					No ducks owned yet.
				</div>
			{/if}

			{#if errorMsg}
				<div
					class="mt-3 rounded-2xl border-2 border-[color:var(--color-accent-4)] bg-[color:var(--color-accent-4)] p-3 text-sm"
					role="alert"
				>
					{errorMsg}
				</div>
			{/if}

			<div class="mt-4 flex justify-end">
				<button
					type="button"
					class="rounded-2xl border-2 border-[color:var(--color-primary)] bg-[color:var(--color-primary)] px-4 py-2 font-semibold text-[color:var(--color-landingpage-subtitle)]"
					onclick={confirm}
					disabled={saving || !tempSelectedId || !ownedAvatars.length}
				>
					{saving ? 'Saving...' : 'OK'}
				</button>
			</div>
		</div>
	</dialog>
</section>

<style>
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}
</style>
