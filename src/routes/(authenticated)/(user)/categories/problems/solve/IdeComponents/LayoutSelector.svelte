<script lang="ts">
	import { goto } from '$app/navigation';
	import { clickOutside } from '$lib/actions/clickOutside';
	import { ApiError, FetchFromApi } from '$lib/api/apiCall';
	import { toast } from '$lib/Components/Notifications/ToastStore.svelte';
	import { userEditorPreferences } from '$lib/stores/theme.svelte';
	import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';
	import { createQuery } from '@tanstack/svelte-query';
	import { fly } from 'svelte/transition';
	import type { LayoutDto } from '../types';
	import PenIconSvg from '$lib/svg/EditorComponentIcons/PenIconSvg.svelte';
	import BinIconSvg from '$lib/svg/EditorComponentIcons/BinIconSvg.svelte';

	let { isVisible = $bindable() }: { isVisible: boolean } = $props();

	let defaultSidebar: HTMLDivElement;
	let defaultEditor: HTMLDivElement;

	let splitLeftEditor: HTMLDivElement;
	let splitRightEditorTop: HTMLDivElement;
	let splitRightEditorBottom: HTMLDivElement;

	let tabbedSlider: HTMLDivElement;
	let tabbedTimeout: number | undefined;

	let renameInputRef: HTMLInputElement | undefined = $state();

	const setLayout = async (layoutId: string) => {
		try {
			let res = await FetchFromApi<LayoutDto>(`user/layout/details?layoutId=${layoutId}`, {
				method: 'PUT'
			});
			userEditorPreferences.layout = res.body;
		} catch (err) {
			if (err instanceof ApiError) {
				toast.error('Could not find layout template');
			} else {
				toast.error('Could not load layout');
			}
		}
	};

	const animateDefaultIn = () => {
		defaultSidebar.style.width = '50%';
		defaultEditor.style.height = '60%';
	};

	const animateDefaultOut = () => {
		defaultSidebar.style.width = '';
		defaultEditor.style.height = '';
	};

	const animateSplitIn = () => {
		splitLeftEditor.style.width = '33%';
		splitRightEditorTop.style.height = '60%';
		splitRightEditorBottom.style.height = '60%';
	};

	const animateSplitOut = () => {
		splitLeftEditor.style.width = '';
		splitRightEditorTop.style.height = '';
		splitRightEditorBottom.style.height = '';
	};

	const animateTabbedIn = () => {
		tabbedSlider.style.transform = 'translateX(-25%)';
		tabbedTimeout = setTimeout(() => {
			tabbedSlider.style.transform = 'translateX(-50%)';
			tabbedTimeout = setTimeout(() => {
				tabbedSlider.style.transform = 'translateX(-75%)';
			}, 300);
		}, 300);
	};

	const animateTabbedOut = () => {
		if (tabbedTimeout) {
			clearTimeout(tabbedTimeout);
		}
		tabbedSlider.style.transform = '';
	};

	type CustomLayout = {
		layoutId: string;
		layoutName: string;
	};

	const customLayoutQuery = createQuery({
		queryKey: ['custom-layouts'],
		queryFn: async () => {
			return await FetchFromApi<CustomLayout[]>('user/layout', {
				method: 'GET'
			});
		}
	});

	const userDefinedLayouts: number = $derived.by(
		() => ($customLayoutQuery.data?.body.length ?? 3) - 3
	);

	let currentlyRenamedLayout: string | undefined = $state();
	let currentlyRenamedLayoutNewName: string | undefined = $state();
	let pendingDeleteLayout: string | undefined = $state();

	const startRename = (layout: CustomLayout) => {
		currentlyRenamedLayout = layout.layoutId;
		currentlyRenamedLayoutNewName = layout.layoutName;
		setTimeout(() => renameInputRef?.focus(), 0);
	};

	const cancelRename = () => {
		currentlyRenamedLayout = undefined;
		currentlyRenamedLayoutNewName = undefined;
	};

	const renameLayout = async (layout: CustomLayout) => {
		if (!currentlyRenamedLayoutNewName || currentlyRenamedLayoutNewName === layout.layoutName) {
			cancelRename();
			return;
		}
		const newNameCapture: string = currentlyRenamedLayoutNewName;
		try {
			let res = await FetchFromApi<{ layoutId: string; newName: string }>('problem/layout', {
				method: 'PATCH',
				body: JSON.stringify({
					layoutId: layout.layoutId,
					newName: newNameCapture
				})
			});
			if (res.status === 'Success') {
				toast.success(`Layout renamed to ${newNameCapture}`);
				$customLayoutQuery.refetch();
			}
		} catch (err) {
			if (err instanceof ApiError) {
				toast.error(err.response.body ?? 'could not rename layout');
			}
		}
		cancelRename();
	};

	const handleRenameKeydown = (e: KeyboardEvent, layout: CustomLayout) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			renameLayout(layout);
		} else if (e.key === 'Escape') {
			cancelRename();
		}
	};

	const confirmDelete = async (layout: CustomLayout) => {
		try {
			let res = await FetchFromApi(
				'problem/layout',
				{
					method: 'DELETE'
				},
				fetch,
				new URLSearchParams({ layoutId: layout.layoutId })
			);
			if (res.status === 'Success') {
				toast.success(`Layout: ${layout.layoutName} deleted`);
				$customLayoutQuery.refetch();
			}
		} catch (err) {
			if (err instanceof ApiError) {
				toast.error(`Could not delete layout: ${err.response.body?.message ?? ''}`);
			}
		}
		pendingDeleteLayout = undefined;
	};
</script>

<main
	use:clickOutside={() => (isVisible = false)}
	transition:fly={{ y: -30, duration: 200 }}
	class="absolute top-full z-100 flex max-h-100 w-75 flex-col overflow-y-auto rounded-lg border border-ide-accent/25 bg-ide-bg"
>
	<div class="flex flex-row items-center justify-between px-5 py-3">
		<span
			class="justify-start border-b border-b-ide-accent/30 text-lg font-semibold text-ide-text-primary"
		>
			Layouts
		</span>
		<span class="text-sm">
			({userDefinedLayouts}/10)
		</span>
	</div>

	{#if $customLayoutQuery.isLoading}
		<div class="flex h-20 w-full flex-row items-center justify-center">
			<div class="h-6 w-6 animate-spin rounded-full border-t-3 border-t-ide-text-primary"></div>
			<span>Loading layouts</span>
		</div>
	{:else}
		<div class="grid w-full grow grid-cols-2 gap-x-2 gap-y-1 p-2">
			{#each $customLayoutQuery.data?.body ?? [] as layout}
				{#if layout.layoutName === 'I use wayland btw'}
					{@render UseWeylandBtw(layout)}
				{:else if layout.layoutName === 'default'}
					{@render Default(layout)}
				{:else if layout.layoutName === 'Tab enjoyer'}
					{@render TabEnjoyer(layout)}
				{:else}
					<div class="group relative flex h-28 w-full flex-col justify-end gap-0.5 p-0.5">
						{#if pendingDeleteLayout !== layout.layoutId}
							<div
								class="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
							>
								<button
									onclick={() => startRename(layout)}
									title="Rename"
									class="cursor-pointer rounded border border-ide-accent/30 bg-ide-bg/90 p-1.5 transition-colors hover:border-ide-accent/50 hover:bg-ide-accent/30"
								>
									<PenIconSvg
										options={{ class: 'w-3.5 h-3.5 stroke-ide-text-primary stroke-[1]' }}
									/>
								</button>
								<button
									onclick={() => (pendingDeleteLayout = layout.layoutId)}
									title="Delete"
									class="cursor-pointer rounded border border-ide-accent/30 bg-ide-bg/90 p-1.5 transition-colors hover:border-red-500/50 hover:bg-red-500/20"
								>
									<BinIconSvg
										options={{ class: 'w-3.5 h-3.5 stroke-ide-text-primary stroke-[1]' }}
									/>
								</button>
							</div>
						{/if}

						{#if pendingDeleteLayout === layout.layoutId}
							<div
								class="absolute inset-0 z-30 flex flex-col items-center justify-center rounded border border-red-500/50 bg-ide-bg/95 p-2"
							>
								<span class="mb-2 text-center text-xs text-ide-text-primary"
									>Delete "{layout.layoutName}"?</span
								>
								<div class="flex gap-2">
									<button
										onclick={() => (pendingDeleteLayout = undefined)}
										class="cursor-pointer rounded border border-ide-accent/30 bg-ide-card px-2 py-1 text-xs text-ide-text-primary transition-colors hover:bg-ide-accent/20"
									>
										Cancel
									</button>
									<button
										onclick={() => confirmDelete(layout)}
										class="cursor-pointer rounded border border-red-500/50 bg-red-500/20 px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/40"
									>
										Delete
									</button>
								</div>
							</div>
						{/if}

						<button
							aria-label="{layout.layoutName} select"
							onclick={async () => await setLayout(layout.layoutId)}
							class="hover:bg-ide-text/10 z-10 flex h-full w-full flex-row gap-0.5 rounded border border-ide-accent/50 bg-ide-card transition-colors duration-300 hover:cursor-pointer focus:ring-2 focus:ring-ide-accent focus:outline-none"
						>
						</button>

						<div class="relative w-full">
							{#if layout.layoutId === currentlyRenamedLayout}
								<input
									bind:this={renameInputRef}
									bind:value={currentlyRenamedLayoutNewName}
									onblur={() => renameLayout(layout)}
									onkeydown={(e) => handleRenameKeydown(e, layout)}
									type="text"
									class="w-full rounded-sm bg-transparent px-3 py-0 font-mono text-xs text-ide-text-primary caret-ide-accent outline-none focus:border-b-1 focus:border-b-ide-accent/20"
								/>
							{:else}
								<span
									class="block justify-center overflow-hidden px-3 font-mono text-xs whitespace-nowrap text-ide-text-primary"
								>
									{layout.layoutName}
								</span>
							{/if}
							<div
								class="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg"
							></div>
						</div>
					</div>
				{/if}
			{/each}
			{#if userDefinedLayouts < 10}
				<div class="flex h-28 w-full flex-col items-center justify-center">
					<button
						onclick={() => goto('solve/editor')}
						class="flex h-full w-full items-center justify-center rounded-xs border border-ide-accent/50 bg-ide-card hover:cursor-pointer focus:ring-2 focus:ring-ide-accent focus:outline-none"
					>
						<CrossIconSvg
							options={{ class: 'h-6 w-6 rotate-45 stroke-ide-text-primary stroke-[3]' }}
						/>
					</button>
					<span class="flex justify-center px-3 font-mono text-xs text-ide-text-primary"
						>Build your own</span
					>
				</div>
			{/if}
		</div>
	{/if}
</main>

{#snippet UseWeylandBtw(layout: CustomLayout)}
	<button
		onclick={() => setLayout(layout.layoutId)}
		onmouseover={animateSplitIn}
		onfocus={animateSplitIn}
		onmouseout={animateSplitOut}
		onblur={animateSplitOut}
		class="flex h-28 w-full flex-col items-center rounded hover:cursor-pointer focus:ring-2 focus:ring-ide-accent focus:outline-none"
	>
		<div class="h-full w-full">
			<div class="flex h-full w-full flex-row gap-0.5 bg-ide-card p-0.5">
				<div
					bind:this={splitLeftEditor}
					class="flex h-full w-1/2 flex-col gap-0.5 rounded-xs transition-all delay-100 duration-200 ease-out"
				>
					<div
						bind:this={splitRightEditorBottom}
						class="h-2/5 w-full rounded-xs border border-ide-accent/50 bg-ide-card transition-all delay-300 duration-200 ease-out"
					></div>
					<div
						class="flex w-full grow flex-row justify-end rounded-xs border border-ide-accent/50 bg-ide-card"
					></div>
				</div>
				<div class="flex h-full grow flex-col gap-0.5 rounded-xs">
					<div
						bind:this={splitRightEditorTop}
						class="h-3/4 w-full rounded-xs border border-ide-accent/50 bg-ide-card transition-all delay-300 duration-200 ease-out"
					></div>
					<div
						class="flex w-full grow flex-row justify-end rounded-xs border border-ide-accent/50 bg-ide-card"
					></div>
				</div>
			</div>
		</div>
		<div class="relative w-full">
			<span
				class=" overflow-hiddenpx-3 block justify-center font-mono text-xs whitespace-nowrap text-ide-text-primary"
			>
				{layout.layoutName}
			</span>
			<div
				class="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg"
			></div>
		</div>
	</button>
{/snippet}

{#snippet TabEnjoyer(layout: CustomLayout)}
	<div class="flex h-28 w-full flex-col">
		<button
			onclick={() => setLayout(layout.layoutId)}
			onmouseover={animateTabbedIn}
			onfocus={animateTabbedIn}
			onmouseout={animateTabbedOut}
			onblur={animateTabbedOut}
			class="flex h-full w-full flex-row items-center rounded bg-ide-bg hover:cursor-pointer focus:ring-2 focus:ring-ide-accent focus:outline-none"
		>
			<div class="h-full w-[95%] overflow-x-hidden">
				<div
					bind:this={tabbedSlider}
					class="transform-all grid h-full w-[400%] grid-cols-4 duration-200 ease-out"
				>
					{#each Array(4) as _, i}
						<div class="h-full w-full px-0.5">
							<div class="h-full w-full rounded-xs border border-ide-accent/50 bg-ide-card"></div>
						</div>
					{/each}
				</div>
			</div>
			<div class="h-full grow rounded-xs border border-ide-accent/50 bg-ide-card"></div>
		</button>
		<div class="relative w-full">
			<span
				class="overflow-hiddenpx-3 block justify-center text-center font-mono text-xs whitespace-nowrap text-ide-text-primary"
			>
				{layout.layoutName}
			</span>
			<div
				class="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg"
			></div>
		</div>
	</div>
{/snippet}

{#snippet Default(layout: CustomLayout)}
	<button
		onclick={() => setLayout(layout.layoutId)}
		onmouseover={animateDefaultIn}
		onfocus={animateDefaultIn}
		onmouseout={animateDefaultOut}
		onblur={animateDefaultOut}
		class="flex h-28 w-full flex-col items-center rounded hover:cursor-pointer focus:ring-2 focus:ring-ide-accent focus:outline-none"
	>
		<div class="flex h-full w-full flex-row gap-0.5 bg-ide-card p-0.5">
			<div
				bind:this={defaultSidebar}
				class="h-full w-1/4 rounded-xs border border-ide-accent/50 bg-ide-card transition-all delay-100 duration-200 ease-out"
			></div>
			<div class="flex h-full grow flex-col gap-0.5 rounded-xs">
				<div
					bind:this={defaultEditor}
					class="h-3/4 w-full rounded-xs border border-ide-accent/50 bg-ide-card transition-all delay-300 duration-200 ease-out"
				></div>
				<div
					class="flex w-full grow flex-row justify-end rounded-xs border border-ide-accent/50 bg-ide-card"
				>
					<div class="w-1.5 border-l border-l-ide-accent"></div>
				</div>
			</div>
		</div>
		<div class="relative w-full">
			<span
				class=" overflow-hiddenpx-3 block justify-center font-mono text-xs whitespace-nowrap text-ide-text-primary"
			>
				{layout.layoutName}
			</span>
			<div
				class="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg"
			></div>
		</div>
	</button>
{/snippet}
