<script lang="ts">
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type { AssistantComponentArgs, AssistantConversationMessage, ChatWindowComponentArgs, CodeEditorComponentArgs, DefaultLayoutTerminalComponentArgs, InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import type { ProblemDetailsDto } from '$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs';
	import { activeProfile } from '$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte';
	import type { ComponentConfig, MyTopLevelComponentArg, WizardComponentArg } from '$lib/Components/GenericComponents/layoutManager/ResizableComponentArg';
	import type { AssistantQuery, AssistantResponse } from '$lib/types/domain/modules/problem/assistant';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';
	import Ide from './Ide.svelte';
	import { onMount } from 'svelte';

	
	let { data }: { data: { hideHeader:boolean, problemLoadResponse: Promise<StandardResponseDto<ProblemDetailsDto>> } } = $props();
	
	let config = $state<Record<string, DefaultLayoutTerminalComponentArgs>>({});

	type testCaseInsertResp = {
		modifiedCodeB64: string
	}

	let loadedData: StandardResponseDto<ProblemDetailsDto> = $state({} as StandardResponseDto<ProblemDetailsDto>)

	onMount(async () => {
		activeProfile.profile = "placeholder";
		loadedData = await data.problemLoadResponse;
		config = {
			'code-editor': { templateContents: loadedData.body.templateContents } as CodeEditorComponentArgs,
			'terminal-comp':  { terminalContents: '' } as TerminalComponentArgs,
			'problem-info':  (await data.problemLoadResponse).body as InfoPanelComponentArgs,
			'test-cases-comp':  { 
				testCases: loadedData.body.testCases,
				InsertTestCase: insertTestCase
			} as TestCaseComponentArgs,
			'assistant-wizard': {
				components: [{
					compId: "new-chat-comp-wrapper",
					component: "TopLevelComponent",
					options: {
						component: {
							compId: "new-chat-comp",
							component: "ChatWindow",
							options: {},
							meta: {
								label: {
									commonName: "New Chat",
									labelFor: "new-chat-comp"
								}
							}
						}
					}
				},
			{
					compId: "new-chat-1-comp-wrapper",
					component: "TopLevelComponent",
					options: {
						component: {
							compId: "new-chat-1-comp",
							component: "ChatWindow",
							options: {},
							meta: {
								label: {
									commonName: "New Chat 1",
									labelFor: "new-chat-1-comp"
								}
							}
						}
					}
				}] as ComponentConfig<MyTopLevelComponentArg<{ pages: CustomPageData<AssistantConversationMessage>[] }>>[]
			} as Partial<WizardComponentArg>,
			'new-chat-comp': {
    			pages: [],
				chatName: "chat-0",
				getFullAssistanceData: (chatname: string, query: string) => {
					return {
						exerciseId: (config['problem-info'] as InfoPanelComponentArgs).problemId,
						codeB64: btoa((config['code-editor'] as CodeEditorComponentArgs).templateContents),
						query: query,
						chatName: chatname
					} as AssistantQuery
				}
			} as ChatWindowComponentArgs
		};
		activeProfile.profile = "default";
	});



  const insertTestCase = async (testCaseId: string) => {
    let res = await FetchFromApi<testCaseInsertResp>("TestCaseInsert", {
      method: "POST",
      body: JSON.stringify({
        userCodeB64: btoa((config['code-editor'] as CodeEditorComponentArgs).templateContents),
        exerciseId: loadedData.body.problemId,
        testCaseId: testCaseId
      })
    });
    (config['code-editor'] as CodeEditorComponentArgs).templateContents = atob(res?.body?.modifiedCodeB64 ?? "")
  } 

</script>

<main class="w-full h-[100vh] bg-ide-bg">
	<Ide bind:components={config} />
</main>