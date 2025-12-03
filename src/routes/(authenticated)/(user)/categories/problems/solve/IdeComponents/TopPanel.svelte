<script lang="ts">
	import { goto } from '$app/navigation';
	import Account from '$lib/svg/account.svelte';
	import SettingsIconSvg from '$lib/svg/SettingsIconSvg.svelte';
	import Run from '$lib/svg/run.svelte';
	import Runner from '$lib/svg/runner.svelte';
	import Upload from '$lib/svg/upload.svelte';
	import LayoutIconSvg from '$lib/svg/LayoutIconSvg.svelte';

	let executeButton: HTMLButtonElement;
	let submitButton: HTMLButtonElement;

	let isExecutin: boolean = $state(false);
	let isSubmitting: boolean = $state(false);

	let {
		executeCallback,
		submitCallback,
		isSettingsPanelShown = $bindable()
	}: {
		executeCallback: (runner: boolean) => void;
		submitCallback: (runner: boolean) => void;
		isSettingsPanelShown: boolean;
	} = $props();

	const execute = (runner: boolean): void => {
		submitButton.style.width = '0';
		executeButton.style.width = '100%';
		executeCallback(runner);
	};

	const submit = (runner: boolean): void => {
		executeButton.style.width = '0';
		submitButton.style.width = '100%';
		submitCallback(runner);
	};

	const toggleSettingsPanel = (): void => {
		isSettingsPanelShown = true;
	};
</script>

<main class="w-full h-full bg-ide-bg flex justify-between items-center">
	<div class="w-[25%] h-full flex justify-start items-center px-5">
		<button class="h-full aspect-square hover:cursor-pointer" onclick={() => {goto('/home')}}>
			<img src="https://placehold.co/400" alt="placeholder" />
		</button>
	</div>
	<!-- placeholder for flex justify between -->
	<div class="w-[8%] h-[70%] rounded-l flex justify-center items-center">
		<button
			bind:this={executeButton}
			class="h-full bg-ide-card hover:bg-ide-card_hovered hover:cursor-pointer aspect-square flex justify-center items-center overflow-hidden
			{isSubmitting
				? 'border-0'
				: 'border-1 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]'}
			{isExecutin ? 'rounded-md' : 'rounded-l-md'}"
			onclick={() => {execute(isExecutin)}}
			aria-label="run-code"
		>
			{#if isExecutin}
				{@render LebeledRunner('Executing')}
			{:else}
				<div class="w-[75%] aspect-square">
					<Run />
				</div>
			{/if}
		</button>
		<button
			bind:this={submitButton}
			class="w-[60%] h-full flex-grow flex justify-center bg-ide-card hover:bg-ide-card_hovered hover:cursor-pointer text-ide-text-primary overflow-hidden
			{isExecutin
				? 'border-0'
				: 'border-1 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]'}
			{isSubmitting ? 'rounded-md' : 'rounded-r-md'} 
			items-center text-center ml-[1px]"
			onclick={()=>{submit(isSubmitting)}}
		>
			{#if isSubmitting}
				{@render LebeledRunner('Submitting')}
			{:else}
				<div class="h-full aspect-square mr-[2%] flex justify-center items-center">
					<Upload args={{ color: '#9290c3' }} />
				</div>
				<span class="flex justify-center items-center text-ide-text-secondary">submit</span>
			{/if}
		</button>
	</div>
	<div class="w-[25%] h-full flex justify-end items-center px-5 gap-7">
		<div class="grow h-full flex flex-row items-center justify-end gap-2">
			<button
				class="h-[55%] aspect-square hover:cursor-pointer flex items-center justify-center transition-transform duration-100 ease-out"
			>
				<LayoutIconSvg options={{ class: 'stroke-ide-text-primary' }} />
			</button>
	
			<button
				onclick={toggleSettingsPanel}
				class="h-[60%] aspect-square hover:cursor-pointer hover:rotate-30 flex items-center justify-center transition-transform duration-100 ease-out"
			>
				<SettingsIconSvg options={{ class: 'stroke-ide-text-primary' }} />
			</button>
		</div>

		<button class="h-[75%] aspect-square hover:cursor-pointer" onclick={() => {}}>
			<Account args={{ color: '#d2d1fc' }} />
		</button>
	</div>
</main>

{#snippet LebeledRunner(label: string)}
	<div class="w-full h-full flex justify-center items-center px-2">
		<div class="h-[90%] aspect-square flex justify-center items-center px-1">
			<Runner />
		</div>
		<span class="flex text-ide-text-secondary text-sm justify-center items-center px-1">{label}</span>
	</div>
{/snippet}
