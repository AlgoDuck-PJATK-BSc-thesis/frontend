<script lang="ts">
    import { goto } from '$app/navigation';
    import Account from '$lib/svg/account.svelte';
    import SettingsIconSvg from '$lib/svg/SettingsIconSvg.svelte';
    import Run from '$lib/svg/run.svelte';
    import Runner from '$lib/svg/runner.svelte';
    import Upload from '$lib/svg/upload.svelte';
    import LayoutIconSvg from '$lib/svg/LayoutIconSvg.svelte';
	import { fly } from 'svelte/transition';
	import LayoutSelector from './LayoutSelector.svelte';

    let isExecuting: boolean = $state(false);
    let isSubmitting: boolean = $state(false);

    let isLayoutSelectionVisible: boolean = $state(false);

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
        isExecuting = true;
        isSubmitting = false;
        executeCallback(runner);
    };

    const submit = (runner: boolean): void => {
        isSubmitting = true;
        isExecuting = false;
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

    <div class="w-[8%] h-[70%] rounded-l flex justify-center shrink-0 items-center gap-[1px]">
        <button
            class="h-full w-[20%] bg-ide-card hover:bg-ide-card_hovered hover:cursor-pointer flex justify-center items-center overflow-hidden transition-all duration-300 ease-in-out
                {isSubmitting ? 'w-0 opacity-0 border-0' : isExecuting ? 'w-full' : 'w-1/2'}
                {isSubmitting ? '' : 'border-1 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]'}
                {isExecuting ? 'rounded-md' : 'rounded-l-md'}"
            onclick={() => {execute(isExecuting)}}
            aria-label="run-code"
        >
            {#if isExecuting}
                {@render LabeledRunner('Executing')}
            {:else}
                <div class="w-[75%] aspect-square">
                    <Run />
                </div>
            {/if}
        </button>

        <button
            class="h-full flex justify-center gap-2 bg-ide-card hover:bg-ide-card_hovered hover:cursor-pointer text-ide-text-primary overflow-hidden transition-all duration-300 ease-in-out
                {isExecuting ? 'w-0 opacity-0 border-0' : isSubmitting ? 'w-full' : 'w-1/2'}
                {isExecuting ? '' : 'border-1 border-ide-accent shadow-[0_0_2px_1px_rgba(255,19,240,0.4),0_0_5px_3px_rgba(255,19,240,0.2)]'}
                {isSubmitting ? 'rounded-md' : 'rounded-r-md'} 
                items-center text-center"
            onclick={() => {submit(isSubmitting)}}
        >
            {#if isSubmitting}
                {@render LabeledRunner('Testing')}
            {:else}
                <Upload options={{ class: "h-[70%] aspect-square stroke-ide-text-primary" }} />
                <span class="flex justify-center items-center text-ide-text-secondary">test</span>
            {/if}
        </button>
    </div>

    <div class="w-[25%] h-full flex justify-end items-center px-5 gap-7">
        <div class="grow h-full flex flex-row items-center justify-end gap-2 relative">
            {#if isLayoutSelectionVisible}
                <div transition:fly={{y: -30, duration: 200}} class="absolute w-75 h-75 z-100 top-full">
                    <LayoutSelector/>
                </div>
            {/if}
        
            <button
                onclick={()=>{isLayoutSelectionVisible = !isLayoutSelectionVisible}}
                class="h-[55%] aspect-square hover:cursor-pointer flex items-center justify-center transition-transform duration-100 ease-out"
            >
                <LayoutIconSvg options={{ class: 'stroke-ide-text-primary stroke-[1.5]' }} />
            </button>
            <button
                onclick={toggleSettingsPanel}
                class="h-[60%] aspect-square hover:cursor-pointer hover:rotate-30 flex items-center justify-center transition-transform duration-100 ease-out"
            >
                <SettingsIconSvg options={{ class: 'stroke-ide-text-primary stroke-[1.5]' }} />
            </button>
        </div>
        <button class="h-[75%] aspect-square hover:cursor-pointer" onclick={() => {}}>
            <Account args={{ color: '#d2d1fc' }} />
        </button>
    </div>
</main>

{#snippet LabeledRunner(label: string)}
    <div class="w-full h-full flex justify-center items-center px-2">
        <div class="h-[90%] aspect-square flex justify-center items-center px-1">
            <Runner />
        </div>
        <span class="flex text-ide-text-secondary text-sm justify-center items-center px-1">{label}</span>
    </div>
{/snippet}