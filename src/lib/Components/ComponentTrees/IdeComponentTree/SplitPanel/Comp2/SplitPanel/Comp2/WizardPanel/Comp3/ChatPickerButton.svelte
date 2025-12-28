<script lang="ts">
    import { onMount } from 'svelte';
    import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';
    import BinIconSvg from '$lib/svg/EditorComponentIcons/BinIconSvg.svelte';
    import PenIconSvg from '$lib/svg/EditorComponentIcons/PenIconSvg.svelte';
    import ThreeDotIconSvg from '$lib/svg/EditorComponentIcons/ThreeDotIconSvg.svelte';

    let {
        onclick,
        label,
        deleteYourself,
        renameYourself
    }: { 
        onclick: () => void; 
        label: string; 
        deleteYourself: () => Promise<boolean>; 
        renameYourself: (newName: string) => void 
    } = $props();

    let isHelperDialogShown: boolean = $state(false);
    let isDeleteDialogShown: boolean = $state(false);
    let isRenaming: boolean = $state(false);
    let chatName: string = $state(label);
    let inputElement: HTMLInputElement | null = $state(null);
    let helperMenuRef: HTMLDivElement | null = $state(null);
    let helperButtonRef: HTMLButtonElement | null = $state(null);

    $effect(() => {
        chatName = label;
    });

    $effect(() => {
        if (isRenaming && inputElement) {
            inputElement.focus();
            inputElement.select();
        }
    });

    const handleClickOutside = (event: MouseEvent) => {
        if (
            isHelperDialogShown && 
            helperMenuRef && 
            helperButtonRef &&
            !helperMenuRef.contains(event.target as Node) &&
            !helperButtonRef.contains(event.target as Node)
        ) {
            isHelperDialogShown = false;
        }
    };

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    });

    const handleBackdropClick = (event: MouseEvent): void => {
        if (event.target === event.currentTarget) {
            toggleDeleteDialog();
        }
    };

    const toggleDeleteDialog = () => {
        isDeleteDialogShown = !isDeleteDialogShown;
        isHelperDialogShown = false;
    };

    const handleRenameSubmit = () => {
        renameYourself(chatName);
        isRenaming = false;
    };

    const handleRenameKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleRenameSubmit();
        } else if (event.key === 'Escape') {
            chatName = label;
            isRenaming = false;
        }
    };
</script>

<div class="flex h-8 w-full flex-row transition-colors duration-300 ease-out">
    <button 
        onclick={() => { if (!isRenaming) onclick(); }} 
        class="h-full w-full rounded-md hover:bg-ide-dcard overflow-hidden"
    >
        {#if isRenaming}
            <input 
                bind:this={inputElement}
                onblur={handleRenameSubmit}
                onkeydown={handleRenameKeydown}
                bind:value={chatName} 
                class="w-full h-full bg-transparent px-3 border-none outline-none text-ide-text-secondary text-left p-0 m-0" 
                type="text"
            />
        {:else}
            <div class="relative w-full h-full flex px-3 items-center overflow-hidden">
                <span class="whitespace-nowrap text-ide-text-secondary">
                    {label}
                </span>
                <div class="absolute right-0 top-0 h-full w-12 bg-gradient-to-r from-transparent to-ide-card pointer-events-none"></div>
            </div>
        {/if}
    </button>
    <div class="relative aspect-square h-full flex-shrink-0">
        <button 
            bind:this={helperButtonRef}
            onclick={() => {
                isHelperDialogShown = !isHelperDialogShown;
            }} 
            class="w-full h-full hover:bg-ide-dcard flex flex-col rounded-[25%] justify-center items-center"
        >
            <ThreeDotIconSvg options={{ class: 'h-6 w-6 stroke-[2] stroke-black' }}/>
        </button>
        {#if isHelperDialogShown}
            <div 
                bind:this={helperMenuRef}
                class="absolute top-9 -right-1 z-[999] flex w-40 flex-col divide-y-2 divide-solid divide-ide-dcard rounded-lg border-2 border-ide-dcard bg-ide-card p-1 text-sm"
            >
                <div class="w-full py-1">
                    <button 
                        onclick={() => {
                            isRenaming = true;
                            isHelperDialogShown = false;
                        }} 
                        class="flex w-full flex-row items-center justify-start gap-2 rounded-md px-3 ease-out hover:bg-ide-dcard"
                    >
                        <PenIconSvg options={{ class: 'h-3 w-3 stroke-[1] stroke-black' }} />
                        <span class="py-1">Rename</span>
                    </button>
                </div>
                <div class="w-full py-1">
                    <button 
                        onclick={toggleDeleteDialog} 
                        class="flex w-full flex-row items-center justify-start gap-2 rounded-md px-3 hover:bg-ide-dcard"
                    >
                        <BinIconSvg options={{ class: 'h-3 w-3 stroke-[1] stroke-black' }} />
                        <span class="py-1">Delete</span>
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

{#if isDeleteDialogShown}
    <div 
        class="w-screen h-screen fixed top-0 left-0 bg-black/25 z-[999] flex flex-col justify-center items-center" 
        onclick={handleBackdropClick} 
        onkeydown={toggleDeleteDialog} 
        role="button" 
        tabindex="0"
    > 
        <div class="flex max-w-80 relative flex-col p-5 gap-2 bg-ide-bg rounded-3xl border-2 border-ide-dcard">
            <button 
                onclick={toggleDeleteDialog} 
                class="w-6 h-6 p-1 hover:bg-ide-dcard absolute top-2 right-4 transition-colors ease-out duration-300 rounded-[30%]"
            >
                <CrossIconSvg options={{ class: "stroke-[2] stroke-black w-full h-full"}}/>
            </button>
            <span class="font-bold text-lg">Delete</span>
            <span class="text-sm">Are you sure you want to delete this chat? This action is <strong>irreversible</strong></span>
            <div class="flex flex-row justify-end gap-1">
                <button class="px-3 py-1 rounded-md border-2 border-ide-dcard" onclick={toggleDeleteDialog}>cancel</button>
                <button 
                    onclick={() => {
                        toggleDeleteDialog();
                        deleteYourself();
                    }} 
                    class="px-3 py-1 rounded-md border-2 border-ide-dcard"
                >
                    delete
                </button>
            </div>
        </div>
    </div>
{/if}