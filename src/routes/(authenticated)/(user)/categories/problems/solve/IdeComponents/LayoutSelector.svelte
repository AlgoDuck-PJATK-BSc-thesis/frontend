<script lang="ts">
	import { goto } from "$app/navigation";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { ApiError, FetchFromApi } from "$lib/api/apiCall";
	import { toast } from "$lib/Components/Notifications/ToastStore.svelte";
	import { userEditorPreferences } from "$lib/stores/theme.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import { createQuery } from "@tanstack/svelte-query";
	import { fly } from "svelte/transition";
	import type { LayoutDto } from "../types";
	import PenIconSvg from "$lib/svg/EditorComponentIcons/PenIconSvg.svelte";
	import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";

	let { isVisible = $bindable() }: { isVisible: boolean } = $props();

	let defaultSidebar: HTMLDivElement;
	let defaultEditor: HTMLDivElement;

	let splitLeftEditor: HTMLDivElement;
	let splitRightEditorTop: HTMLDivElement;
	let splitRightEditorBottom: HTMLDivElement;

	let tabbedSlider: HTMLDivElement;
	let tabbedTimeout: NodeJS.Timeout | undefined;
	
	let renameInputRef: HTMLInputElement | undefined = $state();

	const setLayout = async (layoutId: string) => {
		try{
			let res = await FetchFromApi<LayoutDto>(`user/layout/details?layoutId=${layoutId}`, {
				method: "PUT"
			});
			userEditorPreferences.layout = res.body; 
		}catch(err){
			if (err instanceof ApiError) {
				console.log(err.status);          
				toast.error("Could not find layout template");
			} else {
				toast.error("Could not load layout");
			}	
		}
	}

	const animateDefaultIn = () => {
		defaultSidebar.style.width = '50%';
		defaultEditor.style.height = '60%';
	}

	const animateDefaultOut = () => {
		defaultSidebar.style.width = '';
		defaultEditor.style.height = '';
	}

	const animateSplitIn = () => {
		splitLeftEditor.style.width = '33%';
		splitRightEditorTop.style.height = '60%';
		splitRightEditorBottom.style.height = '60%';
	}

	const animateSplitOut = () => {
		splitLeftEditor.style.width = '';
		splitRightEditorTop.style.height = '';
		splitRightEditorBottom.style.height = '';
	}

	const animateTabbedIn = () => {
		tabbedSlider.style.transform = 'translateX(-25%)';
		tabbedTimeout = setTimeout(() => {
			tabbedSlider.style.transform = 'translateX(-50%)';
			tabbedTimeout = setTimeout(() => {
				tabbedSlider.style.transform = 'translateX(-75%)';
			}, 300);
		}, 300);
	}

	const animateTabbedOut = () => {
		if (tabbedTimeout) {
			clearTimeout(tabbedTimeout);
		}
		tabbedSlider.style.transform = '';
	}

	type CustomLayout = {
		layoutId: string,
		layoutName: string
	}

	const customLayoutQuery = createQuery({
		queryKey: [ "custom-layouts" ],
		queryFn: async () => {
			return await FetchFromApi<CustomLayout[]>("user/layout", {
				method: 'GET',
			})
		}
	});

	const userDefinedLayouts: number = $derived.by(() => ($customLayoutQuery.data?.body.length ?? 3) - 3)

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
		try{
			let res = await FetchFromApi<{ layoutId: string, newName: string }>("problem/layout", {
				method: "PATCH",
				body: JSON.stringify({
					layoutId: layout.layoutId,
					newName: newNameCapture
				})
			});
			if (res.status === "Success"){
				toast.success(`Layout renamed to ${newNameCapture}`);
				$customLayoutQuery.refetch()
			}
		}catch(err){
			if (err instanceof ApiError){
				toast.error(err.response.body ?? "could not rename layout");
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
		try{
			let res = await FetchFromApi("problem/layout", {
				method: "DELETE"
			}, fetch, new URLSearchParams({ layoutId: layout.layoutId }));
			if (res.status === 'Success'){
				toast.success(`Layout: ${layout.layoutName} deleted`);
				$customLayoutQuery.refetch()
			}
		}catch(err){
			if (err instanceof ApiError){
				toast.error(`Could not delete layout: ${err.response.body?.message ?? ""}`);
			}
		}
		pendingDeleteLayout = undefined;
	};
</script>

<main use:clickOutside={() => isVisible = false} transition:fly={{ y: -30, duration: 200 }} class="top-full absolute z-100 w-75 max-h-100 bg-ide-bg overflow-y-auto border border-ide-accent/25 rounded-lg flex flex-col">
	<div class="flex flex-row py-3 px-5 items-center justify-between">
		<span class="text-lg justify-start text-ide-text-primary font-semibold border-b border-b-ide-accent/30">
			Layouts
		</span>
		<span class="text-sm">
			({userDefinedLayouts}/10)
		</span>
	</div>
	
	{#if $customLayoutQuery.isLoading}
		<div class="w-full h-20 flex flex-row items-center justify-center">
			<div class="w-6 h-6 border-t-ide-text-primary border-t-3 animate-spin rounded-full"></div>
			<span>Loading layouts</span>
		</div>	
	{:else}
		<div class="w-full grow grid grid-cols-2 p-2 gap-x-2 gap-y-1">
			{#each $customLayoutQuery.data?.body ?? [] as layout}
				{#if layout.layoutName === "I use wayland btw"}
					{@render UseWeylandBtw(layout)}
				{:else if layout.layoutName === "default"}
					{@render Default(layout)}
				{:else if layout.layoutName === "Tab enjoyer"}
					{@render TabEnjoyer(layout)}
				{:else}
					<div class="group relative w-full h-28 flex flex-col justify-end gap-0.5 p-0.5">
						{#if pendingDeleteLayout !== layout.layoutId}
							<div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-20">
								<button 
									onclick={() => startRename(layout)}
									title="Rename"
									class="p-1.5 rounded bg-ide-bg/90 border border-ide-accent/30 hover:bg-ide-accent/30 hover:border-ide-accent/50 transition-colors cursor-pointer">
									<PenIconSvg options={{class:'w-3.5 h-3.5 stroke-ide-text-primary stroke-[1]'}} />
								</button>
								<button 
									onclick={() => pendingDeleteLayout = layout.layoutId}
									title="Delete"
									class="p-1.5 rounded bg-ide-bg/90 border border-ide-accent/30 hover:bg-red-500/20 hover:border-red-500/50 transition-colors cursor-pointer">
									<BinIconSvg options={{class:'w-3.5 h-3.5 stroke-ide-text-primary stroke-[1]'}} />
								</button>
							</div>
						{/if}

						{#if pendingDeleteLayout === layout.layoutId}
							<div class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-ide-bg/95 rounded border border-red-500/50 p-2">
								<span class="text-xs text-ide-text-primary mb-2 text-center">Delete "{layout.layoutName}"?</span>
								<div class="flex gap-2">
									<button 
										onclick={() => pendingDeleteLayout = undefined}
										class="px-2 py-1 text-xs rounded bg-ide-card border border-ide-accent/30 hover:bg-ide-accent/20 transition-colors cursor-pointer text-ide-text-primary">
										Cancel
									</button>
									<button 
										onclick={() => confirmDelete(layout)}
										class="px-2 py-1 text-xs rounded bg-red-500/20 border border-red-500/50 hover:bg-red-500/40 transition-colors cursor-pointer text-red-400">
										Delete
									</button>
								</div>
							</div>
						{/if}
						
						<button aria-label="{layout.layoutName} select"
							onclick={async () => await setLayout(layout.layoutId)}
							class="w-full h-full hover:cursor-pointer bg-ide-card border border-ide-accent/50 hover:bg-ide-text/10 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ide-accent rounded flex flex-row gap-0.5 z-10">
						</button>
						
						<div class="relative w-full">
							{#if layout.layoutId === currentlyRenamedLayout}
								<input bind:this={renameInputRef}
									bind:value={currentlyRenamedLayoutNewName} 
									onblur={() => renameLayout(layout)}
									onkeydown={(e) => handleRenameKeydown(e, layout)}
									type="text"
									class="w-full bg-transparent text-xs font-mono text-ide-text-primary px-3 py-0 outline-none focus:border-b-1 focus:border-b-ide-accent/20 rounded-sm caret-ide-accent"
								/>
							{:else}
								<span 
									class="block whitespace-nowrap overflow-hidden px-3 justify-center text-xs font-mono text-ide-text-primary">
									{layout.layoutName}
								</span>
							{/if}
							<div class="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg pointer-events-none"></div>
						</div>
					</div>
				{/if}
			{/each}
			<div class="w-full h-28 flex flex-col justify-center items-center">
				<button onclick={() => goto('solve/editor')}
					class="w-full h-full flex justify-center items-center bg-ide-card border border-ide-accent/50 rounded-xs hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent">
					<CrossIconSvg options={{ class: "h-6 w-6 rotate-45 stroke-ide-text-primary stroke-[3]" }} />
				</button>
				<span class="px-3 flex justify-center text-xs font-mono text-ide-text-primary">Build your own</span>
			</div>
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
		class="w-full h-28 flex flex-col items-center hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent rounded"
	>
		<div class="w-full h-full">
			<div class="w-full h-full bg-ide-card flex flex-row p-0.5 gap-0.5">
				<div bind:this={splitLeftEditor}
					class="w-1/2 transition-all ease-out duration-200 delay-100 h-full flex flex-col gap-0.5 rounded-xs">
					<div
						bind:this={splitRightEditorBottom}
						class="w-full h-2/5 transition-all ease-out duration-200 delay-300 rounded-xs bg-ide-card border border-ide-accent/50"></div>
					<div class="w-full grow flex flex-row justify-end rounded-xs bg-ide-card border border-ide-accent/50"></div>
				</div>
				<div class="grow flex flex-col gap-0.5 h-full rounded-xs">
					<div
						bind:this={splitRightEditorTop}
						class="w-full h-3/4 transition-all ease-out duration-200 delay-300 rounded-xs bg-ide-card border border-ide-accent/50"
					></div>
					<div class="w-full grow flex flex-row justify-end rounded-xs bg-ide-card border border-ide-accent/50"></div>
				</div>
			</div>
		</div>
		<div class="relative w-full">
			<span class=" block whitespace-nowrap overflow-hiddenpx-3 justify-center text-xs font-mono text-ide-text-primary">
				{layout.layoutName}
			</span>
			<div class="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg pointer-events-none"></div>
		</div>
	</button>
{/snippet}


{#snippet TabEnjoyer(layout: CustomLayout)}
	<div class="w-full h-28 flex flex-col">
		<button
			onclick={() => setLayout(layout.layoutId)}
			onmouseover={animateTabbedIn}
			onfocus={animateTabbedIn}
			onmouseout={animateTabbedOut}
			onblur={animateTabbedOut}
			class="w-full h-full bg-ide-bg flex flex-row items-center hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent rounded"
		>
			<div class="h-full w-[95%] overflow-x-hidden">
				<div bind:this={tabbedSlider} class="w-[400%] h-full grid grid-cols-4 transform-all duration-200 ease-out">
					{#each Array(4) as _, i}
						<div class="w-full h-full px-0.5">
							<div class="w-full h-full rounded-xs bg-ide-card border border-ide-accent/50"></div>
						</div>
					{/each}
				</div>
			</div>
			<div class="h-full grow bg-ide-card border border-ide-accent/50 rounded-xs"></div>
		</button>
		<div class="relative w-full">
			<span class="block text-center whitespace-nowrap overflow-hiddenpx-3 justify-center text-xs font-mono text-ide-text-primary">
				{layout.layoutName}
			</span>
			<div class="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg pointer-events-none"></div>
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
		class="w-full h-28 flex flex-col items-center hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent rounded">
		<div class="w-full h-full bg-ide-card flex flex-row p-0.5 gap-0.5">
			<div
				bind:this={defaultSidebar}
				class="w-1/4 transition-all ease-out duration-200 delay-100 h-full rounded-xs bg-ide-card border border-ide-accent/50"
			></div>
			<div class="grow flex flex-col gap-0.5 h-full rounded-xs">
				<div
					bind:this={defaultEditor}
					class="w-full h-3/4 transition-all ease-out duration-200 delay-300 rounded-xs bg-ide-card border border-ide-accent/50"
				></div>
				<div class="w-full grow flex flex-row justify-end rounded-xs bg-ide-card border border-ide-accent/50">
					<div class="w-1.5 border-l border-l-ide-accent"></div>
				</div>
			</div>
		</div>
		<div class="relative w-full">
			<span class=" block whitespace-nowrap overflow-hiddenpx-3 justify-center text-xs font-mono text-ide-text-primary">
				{layout.layoutName}
			</span>
			<div class="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg pointer-events-none"></div>
		</div>
	</button>
{/snippet}