<script lang="ts">
    import { goto } from '$app/navigation';
    import Account from '$lib/svg/account.svelte';
    import SettingsIconSvg from '$lib/svg/SettingsIconSvg.svelte';
    import Run from '$lib/svg/run.svelte';
    import Runner from '$lib/svg/runner.svelte';
    import Upload from '$lib/svg/upload.svelte';
    import LayoutIconSvg from '$lib/svg/LayoutIconSvg.svelte';
	import LayoutSelector from './LayoutSelector.svelte';
	import { isIntermediateStatus, isTerminalStatus, type IntermediateStatus, type TerminalStatus } from '$lib/types/domain/modules/problem/solve';
	import HistoryIconSvg from '$lib/svg/EditorComponentIcons/HistoryIconSvg.svelte';
	import PreviousSolutionsPanel from './PreviousSolutionsPanel.svelte';
	import MyProfile from '$lib/Components/Headers/MyProfile.svelte';

    let isLayoutSelectionVisible: boolean = $state(false);
    let isPreviousAttemptOverlayVisible: boolean = $state(false);

    let {
        problemId,
        executingState,
        executeCallback,
        submitCallback,
        isSettingsPanelShown = $bindable(),
        restorePreviousSolutionCallback,
        unloadPreviousSolutionCallback
    }: {
        problemId: string | undefined,
        executingState: IntermediateStatus | TerminalStatus | undefined,
        executeCallback: () => Promise<void>,
        submitCallback: () => Promise<void>,
        restorePreviousSolutionCallback: (solutionId: string) => Promise<void>
        isSettingsPanelShown: boolean;
        unloadPreviousSolutionCallback: (() => void)
    } = $props();


    let currentlyLoadedSolution: string | undefined = $state();

    const toggleSettingsPanel = (): void => {
        isSettingsPanelShown = true;
    };
</script>

<main class="w-full h-full bg-ide-bg flex justify-between items-center">
    <div class="w-[25%] h-full flex justify-start items-center px-8">
        <div class="flex items-center gap-6 whitespace-nowrap">
            <a href="/home" class="text-lg font-semibold text-[color:var(--color-primary)] no-underline">
                AlgoDuck
            </a>
	    </div>
    </div>

    <div class="w-[8%] h-[70%] rounded-l flex justify-center shrink-0 items-center gap-[1px]">
        <button
            class="h-full aspect-square bg-ide-card hover:bg-ide-card_hovered hover:cursor-pointer flex justify-center items-center overflow-hidden transition-all duration-300 ease-in-out
                {(isTerminalStatus(executingState) || executingState === undefined) ? 'rounded-l-md border-1 border-ide-accent/20' : 'w-full rounded-md'}"
            onclick={executeCallback}
            aria-label="run-code">

            {#if isIntermediateStatus(executingState)}
                {@render LabeledRunner(executingState as IntermediateStatus)}
            {:else}
            <div class="h-full aspect-square">    
                <div class="p-[20%]">
                    <Run />
                </div>
            </div>
            {/if}
        </button>

        <button class="h-full flex justify-center gap-2 bg-ide-card hover:bg-ide-card_hovered hover:cursor-pointer text-ide-text-primary overflow-hidden transition-all duration-300 ease-in-out items-center text-center
                {(isTerminalStatus(executingState) || executingState === undefined) ? 'w-full rounded-r-md border-1 border-ide-accent/20' : 'w-0 opacity-0 pointer-events-none'}"
            onclick={submitCallback}
        >
            <Upload options={{ class: "h-[70%] aspect-square stroke-ide-text-primary" }} />
            <span class="flex justify-center items-center text-ide-text-secondary">test</span>
        </button>
    </div>

    <div class="w-[25%] h-full flex justify-end items-center px-5 gap-1">
        <div class="grow h-full flex flex-row items-center justify-end gap-2 relative">
            {#if isLayoutSelectionVisible}
                <LayoutSelector bind:isVisible={isLayoutSelectionVisible}/>
            {/if}
            {#if isPreviousAttemptOverlayVisible}
                <PreviousSolutionsPanel {problemId} bind:isVisible={isPreviousAttemptOverlayVisible} bind:currentlyLoadedSolution {restorePreviousSolutionCallback} {unloadPreviousSolutionCallback}/>
            {/if}
        
            <button
                onclick={()=>{isPreviousAttemptOverlayVisible = !isPreviousAttemptOverlayVisible}}
                class="h-[55%] aspect-square hover:cursor-pointer flex items-center justify-center transition-transform duration-100 ease-out"
            >
                <HistoryIconSvg options={{ class: 'stroke-ide-text-primary stroke-[1.5]' }} />
            </button>            
            <button
                onclick={toggleSettingsPanel}
                class="h-[60%] aspect-square hover:cursor-pointer hover:rotate-30 flex items-center justify-center transition-transform duration-100 ease-out"
            >
                <SettingsIconSvg options={{ class: 'stroke-ide-text-primary stroke-[1.5]' }} />
            </button>                    
            <button
                onclick={()=>{isLayoutSelectionVisible = !isLayoutSelectionVisible}}
                class="h-[55%] aspect-square hover:cursor-pointer flex items-center justify-center transition-transform duration-100 ease-out"
            >
                <LayoutIconSvg options={{ class: 'stroke-ide-text-primary stroke-[1.5]' }} />
            </button>
        </div>
        <button class="h-[75%] aspect-square hover:cursor-pointer px-5" onclick={() => {}}>
            <MyProfile/>
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