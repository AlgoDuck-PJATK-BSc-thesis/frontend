<script lang="ts">
	import type { ChatWindowComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
    import Placeholder from '@tiptap/extension-placeholder'
    import * as signalR from '@microsoft/signalr';
	import { API_URL, FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import { onDestroy } from "svelte";
	import SendMessageIconSvg from "$lib/svg/SendMessageIconSvg.svelte";
	import type { CustomPageData } from "$lib/types/domain/Shared/CustomPageData";
	import type { AssistantQuery, ChatMessage } from "$lib/types/domain/modules/problem/assistant";
    let { options = $bindable() }: { options: ChatWindowComponentArgs } = $props();

    let connected: boolean = $state(false);

    let query: string = $state("");
    type Type = "code" | "text" | "name";

    type StreamingCompletionPart = {
        type: Type
        message: string
    }

    let response: string | undefined = $state();
    let connection: signalR.HubConnection | undefined;


    let hasFetchedInitialData: boolean = false;

    const FetchFromApiSyncWrapper = async (problemId: string) : Promise<StandardResponseDto<CustomPageData<ChatMessage>>> => {
        return await FetchFromApi<CustomPageData<ChatMessage>>("ChatData", {
            method: "GET"
        }, fetch, new URLSearchParams({ page: "1", pageSize: "12", chatName: options.chatName ?? "", problemId: problemId}))
    }

    $effect(() => {
        if (hasFetchedInitialData || !options.problemId || options.pages.length > 0) return;
        let problemIdSync = options.problemId; 
        FetchFromApiSyncWrapper(problemIdSync).then((data: StandardResponseDto<CustomPageData<ChatMessage>>) => {
            options.pages.push(data.body) 
        }).catch((reason => {
            console.log(reason);
        }))
        hasFetchedInitialData = true;
    })

    onDestroy(async () => {
        if (connection){
            await connection.stop();
        }
    });

</script>

<main class="w-full h-full bg-ide-card flex flex-col">
    <div class="w-full h-10 shrink-0 sticky px-8 flex justify-start items-center">
        <span class="rounded-md hover:bg-ide-dcard transition-colors duration-300 ease-out px-5 py-1">
            {options.chatName ?? "New Chat"}
        </span>
    </div>

    <div class="w-full grow bg-blue-500 overflow-y-auto flex flex-col gap-1">
        {#if connected}
            {#if response}
                <div>{response}</div>    
            {:else}
                <div>Thinking</div>
            {/if}
        {/if}
    </div>

    <div class="w-full sticky shrink-0 px-5 py-2 flex justify-center items-center">
        <div {@attach node => {
            let tiptapEditor: Editor = new Editor({
                element: node,
                extensions: [
                    StarterKit,
                    Placeholder.configure({
                        placeholder: '<p>Enter your question here (the assistant is automatically clued in on your code)</p>'
                    })

                ],
                onTransaction: () => {
                    tiptapEditor = tiptapEditor; 
                },
                onUpdate: ({ editor }) => {
                    query = editor.getText()
                }
            })

            return () => {
                tiptapEditor.destroy()
            }
        }} class="w-full"></div>
        <button onclick={async () => {
            connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/hubs/assistant`, {
                withCredentials: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();
            try {
                await connection.start()
                connected = true;
            }catch (err){
                connected = false;
                console.error("failed", err)
            }

            try {
                connection.stream("GetAssistance", {
                    exerciseId: options.problemId,
                    codeB64: btoa(options.getUserCode()),
                    query: btoa(query),
                    chatName: options.chatName
                } as AssistantQuery).subscribe({
                    next: (messagePart: StreamingCompletionPart) => {
                        console.log(messagePart);
                    },
                    complete: () => {
                        connected = false;
                    },
                    error: (err) => {
                        connected = false;
                    }
                })
            }catch(err){}
        }} class="px-3 py-1">
            <SendMessageIconSvg options={{ class: "w-5 h-5 stroke-ide-text-primary stroke-[2]"}}/>
        </button>
    </div>
</main>

<style>
  :global(.tiptap) {
    padding: 1rem;
    background: var(--color-ide-card);
    flex-grow: 0;
  }
  
  :global(.tiptap p.is-editor-empty:first-child::before) {
    color: var(--color-ide-text-secondary);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
</style>