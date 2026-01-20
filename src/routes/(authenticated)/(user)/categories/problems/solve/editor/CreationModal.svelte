<script lang="ts">
	import { clickOutside } from "$lib/actions/clickOutside";
	import { ApiError, type StandardResponseDto } from "$lib/api/apiCall";
	import SuccessIconSvg from "$lib/svg/Toast/SuccessIconSvg.svelte";
	import { useQueryClient } from "@tanstack/svelte-query";
	import type { LayoutCreationResultDto } from "./EditorEditorTypes";
	import { onDestroy } from "svelte";

	let { options = $bindable() }: { 
		options: { 
			isVisible: boolean, 
			onclick: (name: string) => Promise<StandardResponseDto<LayoutCreationResultDto> | undefined> 
		} 
	} = $props()

	let layoutName: string = $state("");
	let isLoading: boolean = $state(false);
	let error: string | null = $state(null);
	let isResultSuccess: boolean | undefined = $state();
	let countdown: number = $state(5);
	let countdownInterval: NodeJS.Timeout | undefined = $state();

	const queryClient = useQueryClient();
	const startCountdown = () => {
		countdown = 5;
		countdownInterval = setInterval(() => {
			countdown--;

			console.log('back')
			if (countdown <= 0) {
				if (countdownInterval) {
					clearInterval(countdownInterval);
					countdownInterval = undefined;
				}
				history.back();
			}
		}, 1000);
	}

	const cancelRedirect = () => {
		if (countdownInterval) {
			clearInterval(countdownInterval);
			countdownInterval = undefined;
		}
		isResultSuccess = undefined;
	}

	const handleSave = async () => {
		error = null;
		isLoading = true;
		
		try {
			let res = await options.onclick(layoutName);
			if (res?.status === "Success") {
				queryClient.invalidateQueries({ queryKey: [ "custom-layouts" ] })  
				isResultSuccess = true;
				startCountdown();
			}
		} catch (err) {
			if (err instanceof ApiError) {
				error = err.response.message || "Failed to create layout";
			} else {
				error = "An unexpected error occurred";
			}
		} finally {
			isLoading = false;
		}
	}
	onDestroy(() => {
		if (countdownInterval)
			clearInterval(countdownInterval);
	})
</script>

<main class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
	
	<div use:clickOutside={() => options.isVisible = false} class="relative w-full max-w-md bg-ide-card border border-ide-accent/20 rounded-2xl shadow-2xl overflow-hidden">
		<div class="px-6 pt-6 pb-4">
			<h2 id="modal-title" class="text-xl font-semibold text-ide-text-primary">
				Save Layout
			</h2>
			<p class="mt-1 text-sm text-ide-text-secondary/60">
				Give your custom layout a name
			</p>
		</div>

		<div class="px-6 pb-6">
			{#if !isResultSuccess}
				<div class="space-y-4">
					<div class="space-y-2">
						<span class="block text-sm font-medium text-ide-text-secondary">
							Layout name
						</span>
						<input bind:value={layoutName} placeholder="My custom layout" disabled={isLoading} type="text"
							class="w-full px-4 py-3 bg-ide-bg border border-ide-accent/20 rounded-xl text-ide-text-primary placeholder:text-ide-text-secondary/40 focus:outline-none focus:border-ide-accent/50 focus:ring-2 focus:ring-ide-accent/20 transition-all disabled:opacity-50"/>
						{#if layoutName.length > 0 && layoutName.length < 3}
							<p class="text-xs text-amber-400/80">Name must be at least 3 characters</p>
						{/if}
					</div>

					{#if error}
						<div class="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
							<p class="text-sm text-red-400">{error}</p>
						</div>
					{/if}

					<div class="flex gap-3 pt-2">
						<button onclick={() => options.isVisible = false} disabled={isLoading}
							class="flex-1 px-4 py-3 bg-ide-dcard/50 hover:bg-ide-dcard text-ide-text-secondary rounded-xl border border-ide-accent/10 font-medium transition-all disabled:opacity-50">
							Cancel
						</button>
						<button onclick={handleSave} disabled={layoutName.length < 3 || isLoading}
							class="flex-1 px-4 py-3 bg-ide-accent/20 hover:bg-ide-accent/30 text-ide-accent rounded-xl border border-ide-accent/40 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2">
							{#if isLoading}
								<div class="w-4 h-4 border-2 border-ide-accent/30 border-t-ide-accent rounded-full animate-spin"></div>
								<span>Saving...</span>
							{:else}
								<span>Save Layout</span>
							{/if}
						</button>
					</div>
				</div>
			{:else}
				<div class="py-4 space-y-5">
					<div class="flex flex-col items-center gap-3">
						<div class="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                            <SuccessIconSvg options={{ class: 'w-7 h-7 stroke-green-400 stroke-[2]'}}/>
						</div>
						<div class="text-center">
							<h3 class="text-lg font-semibold text-ide-text-primary">Layout Saved</h3>
							<p class="text-sm text-ide-text-secondary/60 mt-1">
								"{layoutName}" has been created successfully
							</p>
						</div>
					</div>

					<div class="space-y-3">
						<div class="flex items-center justify-center gap-2 text-sm text-ide-text-secondary">
							<span>Redirecting in</span>
							<span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold tabular-nums">
								{countdown}
							</span>
						</div>
						
						<div class="w-full bg-ide-dcard rounded-full h-1.5 overflow-hidden">
							<div class="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000 ease-linear"
								style="width: {(countdown / 5) * 100}%"></div>
						</div>

						<button onclick={cancelRedirect}
							class="w-full py-2 text-sm text-ide-text-secondary/60 hover:text-ide-text-secondary transition-colors">
							Stay on this page
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
</main>