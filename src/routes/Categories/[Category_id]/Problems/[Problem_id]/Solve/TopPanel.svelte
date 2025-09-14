<script lang="ts">
	import { goto } from '$app/navigation';
	import Account from './svg/account.svelte';
	import Gear from './svg/gear.svelte';
	import Run from './svg/run.svelte';
	import Runner from './svg/runner.svelte';
	import Upload from './svg/upload.svelte';

	let executeButton: HTMLButtonElement;
	let submitButton: HTMLButtonElement;

	let isExecutin: boolean = $state(false);
	let isSubmitting: boolean = $state(false);

	let {
		executeCallback,
		submitCallback,
		isExecuting,
		isSettingsPanelShown = $bindable()
	}: {
		executeCallback: (event: MouseEvent) => void;
		submitCallback: (event: MouseEvent) => void;
		isExecuting: boolean;
		isSettingsPanelShown: boolean;
	} = $props();

	const execute = (event: MouseEvent): void => {
		isExecutin = true;
		submitButton.style.width = '0';
		executeButton.style.width = '100%';
		executeCallback(event);
	};

	const submit = (event: MouseEvent): void => {
		isSubmitting = true;
		executeButton.style.width = '0';
		submitButton.style.width = '100%';
		submitCallback(event);
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
			onclick={execute}
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
			class="w-[60%] h-full flex-grow flex justify-center bg-ide-card hover:bg-ide-card_hovered hover:cursor-pointer text-text-primary overflow-hidden
			{isExecutin
				? 'border-0'
				: 'border-1 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]'}
			{isSubmitting ? 'rounded-md' : 'rounded-r-md'} 
			items-center text-center ml-[1px]"
			onclick={submit}
		>
			{#if isSubmitting}
				{@render LebeledRunner('Submitting')}
			{:else}
				<div class="h-full aspect-square mr-[2%] flex justify-center items-center">
					<Upload args={{ color: '#9290c3' }} />
				</div>
				<span class="flex justify-center items-center text-text-secondary">submit</span>
			{/if}
		</button>
	</div>
	<div class="w-[25%] h-full flex justify-end items-center px-5 gap-7">
		<button
			onclick={toggleSettingsPanel}
			class="h-[75%] aspect-square hover:cursor-pointer hover:rotate-30 transition-transform duration-100 ease-out"
		>
			<Gear args={{ color: '#d2d1fc' }} />
		</button>

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
		<span class="flex text-text-secondary text-sm justify-center items-center px-1">{label}</span>
	</div>
{/snippet}
