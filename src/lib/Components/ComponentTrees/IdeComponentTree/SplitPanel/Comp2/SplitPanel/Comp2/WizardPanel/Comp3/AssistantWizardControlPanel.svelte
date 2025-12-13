<script lang="ts">
	import type { ChatWindowComponentArgs, AssistantConversationMessage } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import type { ControlPanelArgs } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import type { ChatMessage } from "$lib/types/domain/modules/problem/assistant";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";

    let { options = $bindable() }: { options: ControlPanelArgs } = $props();

    const handleSelect = (selected: string) => {
        if (options.controlCallbacks?.select){
            options.controlCallbacks!.select(selected);
        }else{
            options.selectedElemId = selected;
        }
    }
</script>

<main class="w-70 h-full bg-ide-card border-r-2 border-r-ide-dcard flex flex-col gap-3 justify-start items-center">
    <div class="w-full flex flex-col items-center">
        <div class="w-full py-2 px-1">
            <button onclick={() => {
                if (options.controlCallbacks?.insert && options.controlCallbacks.checkIfHasNewComponent && !options.controlCallbacks.checkIfHasNewComponent()){
                    let dateNow: number = Date.now();
                    let compId: string = `chat-${dateNow}`;
                    options.controlCallbacks!.insert({
                        compId: compId,
                        compType: 'ChatWindow',
                        compCommonName: undefined,
                        compArgs: {
                            chatName: undefined,
                            pages: [] as CustomPageData<ChatMessage>[]
                        } as ChatWindowComponentArgs
                    });
                    if (options.controlCallbacks?.addInsertedComponentToRoot){
                        options.controlCallbacks.addInsertedComponentToRoot(compId);
                    }
                }
            }} class="flex w-full h-10 rounded-full flex-row justify-center gap-2 items-center bg-ide-dcard/50 transition-colors duration-300 ease-out hover:bg-ide-dcard">
                <CrossIconSvg options={{ class: "h-4 w-4 stroke-ide-text-secondary rotate-45 stroke-[3]" }}/>
                <span class="text-sm font-semibold text-ide-text-secondary">New Chat</span>
            </button>
        </div>
    </div>
    <div class="w-full h-full flex flex-col justify-start px-3 gap-2">
        <span class="w-full flex justify-start font-mono text-xs text-ide-text-secondary">Recent</span>
        <div class="w-full flex flex-col items-center justify-start gap-1">
            {#each options.labels as label}
            <button onclick={() => {handleSelect(label.labelFor)}} class="w-full h-10 hover:bg-ide-dcard px-3 rounded-md">
                <span class="w-full flex flex-nowrap overflow-hidden text-ide-text-secondary grow-0 items-start">{label.commonName ?? "New Chat"}</span>
            </button>
            {:else}
                <div class="w-full grow bg-red-500">nothing just yet</div>
            {/each}
        </div>
    </div>
</main>