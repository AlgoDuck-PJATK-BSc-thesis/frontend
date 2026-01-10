<script lang="ts">
	import { goto } from "$app/navigation";
	import { clickOutside } from "$lib/actions/clickOutside";
	import { FetchFromApi } from "$lib/api/apiCall";
	import { toast } from "$lib/Components/Notifications/ToastStore.svelte";
	import { userEditorPreferences } from "$lib/stores/theme.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import { createQuery } from "@tanstack/svelte-query";
	import { fly } from "svelte/transition";
	import type { LayoutDto } from "../types";

	let { registerAndSelectLayout, isVisible = $bindable() }: { isVisible: boolean, registerAndSelectLayout: ((layoutId: string) => Promise<void>) } = $props();

	let defaultSidebar: HTMLDivElement;
	let defaultEditor: HTMLDivElement;

	let splitLeftEditor: HTMLDivElement;
	let splitRightEditorTop: HTMLDivElement;
	let splitRightEditorBottom: HTMLDivElement;

	let tabbedSlider: HTMLDivElement;
	let tabbedTimeout: NodeJS.Timeout | undefined;
	
	const setLayout = async (layoutId: string) => {
		try{
			let res = await FetchFromApi<LayoutDto>(`user/layout/details?layoutId=${layoutId}`, {
				method: "GET"
			});
			userEditorPreferences.layout = res.body; 
		}catch(err){
			toast.error("Could not load layout");
		}
		// userEditorPreferences.layout = layout;
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

	// const layoutDetailsQuery = $derived(createQuery({
	// 	queryKey: [ "custom-layout-details" ],
	// 	queryFn: async () => {

	// 	}
	// }));


	const customLayoutQuery = createQuery({
		queryKey: [ "custom-layouts" ],
		queryFn: async () => {
			return await FetchFromApi<CustomLayout[]>("user/layout", {
				method: 'GET',
			})
		}
	});

	$inspect($customLayoutQuery.data)

</script>

<main use:clickOutside={() => isVisible = false} transition:fly={{ y: -30, duration: 200 }} class="top-full absolute z-100 w-75 max-h-100 bg-ide-bg overflow-y-auto border border-ide-accent/25 rounded-lg flex flex-col">
	<span class="py-3 px-5 text-lg justify-start w-full text-ide-text-primary font-semibold border-b border-b-ide-accent/30">
		Layouts
	</span>
	
	{#if $customLayoutQuery.isLoading}
		<div class="w-full h-20 flex flex-row items-center justify-center">
			<div class="w-6 h-6 border-t-ide-text-primary border-t-3 animate-spin"></div>
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
					<button onclick={async () => {
						await registerAndSelectLayout(layout.layoutId);
					}} class="w-full hover:bg-ide-text/10 duration-300 ease-out transition-colors h-28 flex flex-col justify-end gap-0.5 p-0.5">
						<div class="w-full h-full hover:cursor-pointer bg-ide-card border border-ide-accent/50 focus:outline-none focus:ring-2 focus:ring-ide-accent rounded flex flex-row gap-0.5"></div>
						<div class="relative w-full">
							<span class=" block whitespace-nowrap overflow-hiddenpx-3 justify-center text-xs font-mono text-ide-text-primary">
								{layout.layoutName}
							</span>
							<div class="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-ide-bg pointer-events-none"></div>
						</div>
					</button>
				{/if}
			{/each}
			<div class="w-full h-28 flex flex-col justify-center items-center">
				<button
					onclick={() => goto('solve/editor')}
					class="w-full h-full flex justify-center items-center bg-ide-card border border-ide-accent/50 rounded-xs hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent"
				>
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