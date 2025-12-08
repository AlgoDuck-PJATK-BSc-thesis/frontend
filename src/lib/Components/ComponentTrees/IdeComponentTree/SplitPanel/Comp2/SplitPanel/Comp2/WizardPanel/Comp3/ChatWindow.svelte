<script lang="ts">
	import type { ChatWindowComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import SendMessageIconSvg from "$lib/svg/SendMessageIconSvg.svelte";
	import { Editor } from "@tiptap/core";
	import StarterKit from "@tiptap/starter-kit";
    import * as signalR from '@microsoft/signalr';
	import { API_URL } from "$lib/api/apiCall";
	import { onDestroy } from "svelte";

    let { options }: { options: ChatWindowComponentArgs } = $props();
    $inspect(options);

    let connected: boolean = $state(false);

    let query: string = $state("");
    type Type = "code" | "text" | "name";

    type StreamingCompletionPart = {
        type: Type
        message: string
    }

    let response: string | undefined = $state();

    $inspect(response);
    let connection: signalR.HubConnection | undefined;

    onDestroy(async () => {
        if (connection){
            await connection.stop();
        }
    });

    $inspect(connected);
</script>

<main class="w-full h-full bg-ide-card flex flex-col">
    <div class="w-full h-10 shrink-0 sticky px-8 flex justify-start items-center">
        <span class="rounded-md hover:bg-ide-dcard transition-colors duration-300 ease-out px-5 py-1">
            {options.chatName}
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
                extensions: [StarterKit],
                content: '<p>Enter your question here (the assistant is automatically clued in on your code)</p>',
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
                connection.stream("GetAssistance", options.getFullAssistanceData(options.chatName, btoa(query))).subscribe({
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