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
	import type { AssistantQuery, ChatMessage, MessageFragment } from "$lib/types/domain/modules/problem/assistant";
    import hljs from 'highlight.js/lib/core';
    import java from 'highlight.js/lib/languages/java';

    import 'highlight.js/styles/dark.css';
	import MarkdownRenderer from "$lib/Components/Misc/MarkdownRenderer.svelte";
	import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";
	import CopyIconSvg from "$lib/svg/EditorComponentIcons/CopyIconSvg.svelte";
	import MessageIconSvg from "$lib/svg/EditorComponentIcons/MessageIconSvg.svelte";
	import BugIconSvg from "$lib/svg/EditorComponentIcons/BugIconSvg.svelte";
	import ReviewIconSvg from "$lib/svg/EditorComponentIcons/ReviewIconSvg.svelte";
	import SuggestionComponent, { type SuggestionCardArgs } from "./SuggestionComponent.svelte";
	import TickIconSvg from "$lib/svg/EditorComponentIcons/TickIconSvg.svelte";
	import type { AvatarResponse } from "$lib/Components/Headers/MyProfile";

    let { options = $bindable() }: { options: ChatWindowComponentArgs } = $props();
    
    let chatId: string = $derived(options.chatId);
    
    hljs.registerLanguage('java', java);

    let userQuery: string = $state("");
    type FragmentType = "Code" | "Text" | "Name" | "Id";

    type StreamingCompletionPart = {
        type: FragmentType
        message: string
    }
    

    const avatarQuery = createQuery({
        queryFn: async () => {
            return await FetchFromApi<AvatarResponse>("item/avatar", {
                method: "GET"
            });
        },
        queryKey: [ "selected-icon" ]
    });

    
    const infiniteQuery = createInfiniteQuery({
        queryKey: [ options.chatId ],
        initialPageParam: 1,
        queryFn: async ({ pageParam = 1 }: { pageParam: number }) => {
            const existingPage: CustomPageData<ChatMessage> | undefined = options.pages.find(p => p.currPage === pageParam);
            if (existingPage) {
                return { body: existingPage } as StandardResponseDto<CustomPageData<ChatMessage>>;
            }

            let data: StandardResponseDto<CustomPageData<ChatMessage>> = await FetchFromApi<CustomPageData<ChatMessage>>("ChatData", { 
                method: "GET" 
            },fetch, new URLSearchParams({ page: `${pageParam}`, pageSize: "12", chatId: options.chatId! }));
            
            if (!existingPage) {
                options.pages.push(data.body);
            }
            return data;
        },
        getPreviousPageParam: (firstPage: StandardResponseDto<CustomPageData<ChatMessage>>) => firstPage.body.prevCursor ?? undefined,
        getNextPageParam: (lastPage: StandardResponseDto<CustomPageData<ChatMessage>>) => lastPage.body.nextCursor ?? undefined,
        select: (data: any) => data.pages.map((p: any) => p.body.items).flat(),
        get enabled() {
            return !!options.chatId;
        }
    });

    /* 
     * don't remove this, we're using the infinite query for infinite fetching,
     * but pages get accumulated in the layout manager cache
     * so even if it seems like we're not directly using $infinite query
     * it's data is side channeled into the thing we pull from. Hence the subscription NEEDS to stay
     */
    $infiniteQuery 

    let allMessages = $derived(
        options.pages
            .flatMap(page => page.items)
            .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime())
    );
    let connection: signalR.HubConnection | undefined;
    $inspect(connection)

    let htmlDivs: HTMLDivElement[] = $state([]);
    let tiptapEditor: Editor | undefined;

    const sendMessage = async () => {
        console.log('huh');
        if (!userQuery.trim() || options.isConnected === true) return;
        let startedWithouChatName: boolean = options.chatName === undefined;
        if (options.pages.length == 0){
            options.pages.unshift({
                currPage: 1,
                pageSize: 12,
                totalItems: 1,
                items: []
            })
        }

        options.pages[0].items.unshift({
            fragments: [{
                content: userQuery,
                type: "Text"
            } as MessageFragment],
            messageAuthor: "User"
        } as ChatMessage)
        
        connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/assistant`, {
            withCredentials: true,
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .build();            

        try {
            await connection.start()
            options.isConnected = true;
            console.log("connected")
        }catch (err){
            options.isConnected = false;
            console.error("failed", err)
            return;
        }

        let currentlyReading: FragmentType | undefined;
        let inserted: boolean = false;

        try {
            connection.stream("GetAssistance", {
                chatId: chatId,
                exerciseId: options.problemId,
                codeB64: btoa(options.getUserCode()),
                query: userQuery,
            } as AssistantQuery).subscribe({
                next: (messagePart: StandardResponseDto<StreamingCompletionPart>) => {
                    console.log(messagePart);
                    if (messagePart.body.type === "Id"){
                        options.chatId = messagePart.body.message;
                        chatId = messagePart.body.message;
                        console.log(chatId);
                        return;                    
                    }

                    if (!inserted){
                        options.pages[0].items.unshift({
                            fragments: [] as MessageFragment[],
                            messageAuthor: "Assistant",
                            createdOn: new Date(Date.now())
                        });
                        inserted = true;
                    }

                    let message: ChatMessage | undefined = options.pages.at(0)?.items?.at(0)
                    if (!message) return;

                    switch (messagePart.body.type){
                        case "Code":
                            if (currentlyReading !== "Code"){
                                currentlyReading = "Code"
                                message.fragments.unshift({
                                    type: "Code",
                                    content: ""
                                } as MessageFragment)
                            }
                            message.fragments[0].content += messagePart.body.message;
                            message.fragments[0].content.replaceAll("&gt;", '<')
                            message.fragments[0].content.replaceAll("&lt;", '>')
                            break;
                        case "Text":
                            if (currentlyReading !== "Text"){
                                currentlyReading = "Text"
                                message.fragments.unshift({
                                    type: "Text",
                                    content: ""
                                } as MessageFragment)
                            }
                            message.fragments[0].content += messagePart.body.message;
                            message.fragments[0].content.replaceAll("&gt;", '<')
                            message.fragments[0].content.replaceAll("&lt;", '>')
                            break;
                        case "Name":
                            if (startedWithouChatName){                                
                                options.chatName = options.chatName ? options.chatName + messagePart.body.message : messagePart.body.message;
                                options.changeLabel(options.chatId, options.chatName);
                            }
                            break;
                      }
                },
                complete: () => {
                    console.log('completed');
                    connection?.stop()
                    options.isConnected = false;
                },
                error: (err) => {
                    console.log('error inner');
                    console.log(`error: ${err}`);
                    connection?.stop()
                    options.isConnected = false;
                }
            })
        }catch(err){
            console.log('error outer');
            console.log(`error: ${err}`);
            options.isConnected = false;
        }finally{
            console.log('finally outer');
        if (tiptapEditor) {
                tiptapEditor.commands.clearContent();
            }
        }
    }

    const suggestionPrompts: SuggestionCardArgs[] = [
        { icon: BugIconSvg, prompt: "Help me debug this code" },
        { icon: ReviewIconSvg, prompt: "Review my solution" }
    ];

    const useSuggestion = (prompt: string) => {
        if (tiptapEditor) {
            tiptapEditor.commands.setContent(prompt);
            userQuery = prompt;
            console.log(userQuery);
            sendMessage();
        }
    }
    let hasBeenCopied: boolean = $state(false);
    let copyDebounceTimeout: NodeJS.Timeout | undefined = $state(); 
</script>

<main class="w-full h-full bg-gradient-to-br from-ide-card to-ide-bg flex flex-col relative">
    <div class="w-full h-12 shrink-0 sticky px-6 flex justify-start items-center border-b border-ide-bg/50 backdrop-blur-sm bg-ide-card/80">
        <div class="flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
            <span class="rounded-lg hover:bg-ide-dcard transition-all duration-300 ease-out px-4 py-1.5 text-ide-text-primary font-medium">
                {options.chatName ?? "New Chat"}
            </span>
        </div>
    </div>

        <div {@attach node => {
            if (!htmlDivs[0]) return;
            const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
                if (entries[0].isIntersecting){
                    $infiniteQuery.fetchNextPage();
                }
            },{
                root: node,
                rootMargin: '200px 0px 0px 0px',
                threshold: 0
            });
            observer.observe(htmlDivs[htmlDivs.length - 1]);
            return () => observer.disconnect();
        }} class="w-full grow bg-transparent overflow-y-auto flex flex-col-reverse gap-4 px-6 py-4 messages-container">
            {#if allMessages.length === 0}
                {@render EmptyState()}
            {:else}
                {#each allMessages as message, i}
                    {#if message.messageAuthor === "Assistant"}
                        {@render AssistantMessage(message, i)}
                    {:else}
                        {@render UserMessage(message, i)}
                    {/if}
                {/each}
            {/if}
        </div>

    
    <div class="w-full sticky shrink-0 px-6 py-4 flex justify-center items-center border-t border-ide-bg/30 backdrop-blur-md bg-ide-card/40">
        <div class="w-full max-w-4xl relative">
            <div class="w-full chat-editor-wrapper">
                <div {@attach node => {
                    tiptapEditor = new Editor({
                        element: node,
                        extensions: [
                            StarterKit,
                            Placeholder.configure({
                                placeholder: 'Ask a question about your code... (Press Enter to send, Shift+Enter for new line)'
                            })
                        ],
                        onTransaction: () => {
                            tiptapEditor = tiptapEditor;
                        },
                        onUpdate: ({ editor }) => {
                            userQuery = editor.getText()
                        },
                        editorProps: {
                            handleKeyDown: (view, event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    sendMessage();
                                    return true;
                                }
                                return false;
                            }
                        }
                    })
                    return () => {
                        tiptapEditor?.destroy()
                    }
                }} class="w-full"></div>
            </div>
            <button 
                onclick={sendMessage} class="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition-all duration-300 ease-out
                       {options.isConnected === true || !userQuery.trim() 
                           ? 'bg-ide-dcard/50 cursor-not-allowed opacity-50' 
                           : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105 active:scale-95'}">
                {#if options.isConnected === true}
                    <div class="w-5 h-5 border-2 border-ide-text-primary/20 border-t-ide-text-primary rounded-full animate-spin"></div>
                {:else}
                    <SendMessageIconSvg options={{ class: "w-5 h-5 stroke-ide-text-primary stroke-[2]"}}/>
                {/if}
            </button>
        </div>
    </div>
</main>

{#snippet EmptyState()}
    <div class="w-full h-full flex flex-col items-center justify-start gap-10 empty-state-fade-in overflow-y-auto">
            <div class="w-24 aspect-square rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-purple-500/10">
                <MessageIconSvg options={{ class: "w-12 h-12 stroke-[1.5] stroke-ide-text-primary"}}/>
            </div>

        <div class="text-center space-y-2">
            <h3 class="text-xl font-semibold text-ide-text-primary">Start a Conversation</h3>
            <p class="text-sm text-ide-text-secondary max-w-sm">
                Ask me anything about your code. I can help you debug, explain concepts, or optimize your solution.
            </p>
        </div>

        <div class="grid grid-cols-2 gap-3 max-w-md">
            {#each suggestionPrompts as suggestion}
                <SuggestionComponent options={{ 
                    ...suggestion,
                    onclick: () => useSuggestion(suggestion.prompt ?? "")
                    }}/>
            {/each}
        </div>

        <div class="flex items-center gap-8 text-xs text-ide-text-secondary/60">
            <div class="flex flex-row gap-2 c">
                <kbd class="px-2 py-1 rounded bg-ide-dcard/50 border border-ide-bg/30 font-mono">Enter</kbd>
                <span class="flex items-center">to send</span>
            </div>
            <div class="flex flex-row gap-2 items-center">
                <kbd class="px-2 py-1 rounded bg-ide-dcard/50 border border-ide-bg/30 font-mono">Shift + Enter</kbd>
                <span class="flex items-center">for new line</span>
            </div>
        </div>
    </div>
{/snippet}

{#snippet UserMessage(message: ChatMessage, index: number)}
    <div 
        bind:this={htmlDivs[htmlDivs.length]} 
        class="w-[85%] self-end py-3 px-4 flex rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex-col-reverse gap-3 border border-blue-500/20 backdrop-blur-sm shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 message-slide-in"
        style="animation-delay: {index * 50}ms"
    >
        {#each message.fragments as fragment}
            {#if fragment.type === "Code" || fragment.type === 1}
                {@render CodeFragment(fragment.content)}
            {:else}
                {@render TextFragment(fragment.content)}
            {/if}
        {/each}
    </div>
{/snippet}

{#snippet AssistantMessage(message: ChatMessage, index: number)}
    <div 
        bind:this={htmlDivs[htmlDivs.length]} 
        class="w-[90%] self-start py-3 px-4 flex rounded-2xl bg-gradient-to-br from-ide-dcard/60 to-ide-card/40 flex-col-reverse gap-3 border border-ide-bg/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 message-slide-in"
        style="animation-delay: {index * 50}ms"
    >
        <div class="flex items-center gap-2 pb-2 border-b border-ide-bg/30">
            <div class="w-10 h-10 rounded-full overflow-hidden flex justify-center items-center bg-ide-dcard border-1 border-ide-accent/20 relative">
                {#if $avatarQuery.isLoading || $avatarQuery.data === undefined}
                    <div class="w-7 h-7 border-t-3 border-t-ide-text-primary rounded-full animate-spin"></div>
                {:else}
                    <img class="absolute w-20 h-20 max-w-none -scale-x-100 -mb-2 -ml-5" src={`https://d3018wbyyxg1xc.cloudfront.net/duck/${$avatarQuery.data.body.itemId}/Sprite.png`} alt="">
                {/if}
            </div>
            <span class="text-xs text-ide-text-secondary font-medium">Assistant</span>
        </div>
        {#each message.fragments as fragment}
            {#if fragment.type === "Code" || fragment.type === 1}
                {@render CodeFragment(fragment.content)}
            {:else}
                {@render TextFragment(fragment.content)}
            {/if}
        {/each}
    </div>
{/snippet}

{#snippet CodeFragment(content: string)}
    <div class="rounded-xl overflow-hidden border border-ide-bg/30 shadow-inner hover:shadow-lg transition-shadow duration-300">
        <div class="bg-ide-bg/50 px-4 py-2 flex items-center justify-between border-b border-ide-bg/30">
            <span class="text-xs text-ide-text-secondary font-mono">Java</span>
            <button onclick={() => {
                navigator.clipboard.writeText(content);
                hasBeenCopied = true;
                if (copyDebounceTimeout)
                    clearTimeout(copyDebounceTimeout)
                
                copyDebounceTimeout = setTimeout(() => {
                    hasBeenCopied = false;
                }, 5_000)
            }} class="p-2 hover:bg-ide-dcard transition-colors duration-300 ease-out rounded" style="corner-shape: squircle; border-radius: 100px;">
                {#if hasBeenCopied}
                    <TickIconSvg options={{ class: "w-4 h-4 stroke-[2] stroke-ide-text-secondary hover:stroke-ide-text-primary transition-colors ease-out duration-300"}}/>
                {:else}
                    <CopyIconSvg options={{ class: "w-4 h-4 stroke-[2] stroke-ide-text-secondary hover:stroke-ide-text-primary transition-colors ease-out duration-300"}}/>
                {/if}
            </button>
        </div>
        {@html `<pre class="hljs language-java text-xs px-4 py-3"><code>${hljs.highlight(content, { language: 'java' }).value}</code></pre>`}
    </div>
{/snippet}

{#snippet TextFragment(content: string)}
    <MarkdownRenderer options={{ markdown: content, class:"w-full text-ide-text-primary text-sm font-mono px-1 py-1 leading-relaxed"}}/>
{/snippet}

<style>
  .chat-editor-wrapper :global(.tiptap) {
    padding: 1rem 3.5rem 1rem 1rem;
    background: var(--color-ide-dcard);
    border-radius: 0.75rem;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    min-height: 3rem;
    max-height: 12rem;
    overflow-y: auto;
  }
  
  .chat-editor-wrapper :global(.tiptap:focus) {
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    outline: none;
  }
  
  .chat-editor-wrapper :global(.tiptap p.is-editor-empty:first-child::before) {
    color: var(--color-ide-text-secondary);
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
    opacity: 0.5;
  }

  .chat-editor-wrapper :global(.tiptap p) {
    margin: 0;
  }

  .chat-editor-wrapper :global(.tiptap::-webkit-scrollbar) {
    width: 6px;
  }

  .chat-editor-wrapper :global(.tiptap::-webkit-scrollbar-track) {
    background: transparent;
  }

  .chat-editor-wrapper :global(.tiptap::-webkit-scrollbar-thumb) {
    background: var(--color-ide-bg);
    border-radius: 3px;
  }

  .messages-container::-webkit-scrollbar {
    width: 8px;
  }

  .messages-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background: var(--color-ide-dcard);
    border-radius: 4px;
  }

  .messages-container::-webkit-scrollbar-thumb:hover {
    background: var(--color-ide-bg);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-slide-in {
    animation: slideIn 0.4s ease-out forwards;
    opacity: 0;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .empty-state-fade-in {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  @keyframes float1 {
    0%, 100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(5px, -8px);
    }
  }

  @keyframes float2 {
    0%, 100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(-6px, -5px);
    }
  }

  @keyframes float3 {
    0%, 100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(4px, 6px);
    }
  }

  @keyframes suggestionSlideIn {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

</style>