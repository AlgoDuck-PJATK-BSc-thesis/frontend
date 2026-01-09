<script lang="ts">
	import { FetchFromApi } from "$lib/api/apiCall";
	import type { ChatWindowComponentArgs, AssistantConversationMessage } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import type { ControlPanelArgs } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
	import { toast } from "$lib/Components/Notifications/ToastStore.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import type { ChatMessage } from "$lib/types/domain/modules/problem/assistant";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
	import ChatPickerButton from "./ChatPickerButton.svelte";

    let { options = $bindable() }: { options: ControlPanelArgs } = $props();

    const handleSelect = (selected: string) => {
        console.log('selecting: ', selected)
        if (options.controlCallbacks?.select){
            options.controlCallbacks!.select(selected);
        }else{
            options.selectedElemId = selected;
        }
    }

    let removeCallback: ((compId: string) => Promise<boolean>) | undefined = $derived.by(() => {
        if (!options.controlCallbacks?.remove) return undefined;
        return options.controlCallbacks?.remove as (compId: string) => Promise<boolean>
    })

    let renameCallback: ((compId: string, newName: string) => Promise<void>) | undefined = $derived.by(() => {
        if (!options.controlCallbacks?.rename) return undefined;
        return options.controlCallbacks?.rename as (compId: string, newName: string) => Promise<void>
    })
</script>

<main class="w-70 h-full bg-ide-card border-r-2 shrink-0 min-w-70 border-r-ide-dcard flex flex-col gap-3 justify-start items-center">
    <div class="w-full flex flex-col items-center">
        <div class="w-full py-2 px-1">
            <button onclick={async () => {
                if (options.controlCallbacks?.insert && options.controlCallbacks.checkIfHasNewComponent && !options.controlCallbacks.checkIfHasNewComponent()){
                    if (!options.controlCallbacks.getProblemId) return;
                    const problemId: string = options.controlCallbacks.getProblemId();
                    try{
                        let result = await FetchFromApi<{ chatId: string }>("problem/assistant/chat", {
                            method: "POST"
                        }, fetch , new URLSearchParams({ problemId: problemId }))

                        if (options.labels.map(l => l.labelFor).some(l => l === problemId)){
                            return;
                        }

                        options.controlCallbacks!.insert({
                            compId: result.body.chatId,
                            compType: 'ChatWindow',
                            compCommonName: undefined,
                            compArgs: {
                                chatName: undefined,
                                pages: [] as CustomPageData<ChatMessage>[]
                            } as ChatWindowComponentArgs
                        });
                        if (options.controlCallbacks?.addInsertedComponentToRoot){
                            options.controlCallbacks.addInsertedComponentToRoot(result.body.chatId, {
                                chatId: result.body.chatId
                            });
                        }    

                    }catch(Error){
                        toast.error("Could not create chat");
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
        <div class="w-full h-full flex flex-col items-center justify-start gap-1">
            {#each options.labels as label}
                <ChatPickerButton onclick={() => handleSelect(label.labelFor)} label={label.commonName ?? "New Chat"} 
                deleteYourself={async () => {
                    if (removeCallback){ 
                        return await removeCallback(label.labelFor);
                    }
                    return false
                }} 
                renameYourself={async (newName: string) => {
                    if (renameCallback) {
                        if (label.commonName !== newName){
                            await renameCallback(label.labelFor, newName)
                        }
                    };
                }}/>
            {:else}
                <div class="w-full h-full flex flex-col justify-center items-center">
                    <span>nothing just yet. Click "New chat" to start chatting!</span>
                </div>
            {/each}
        </div>
    </div>

</main>