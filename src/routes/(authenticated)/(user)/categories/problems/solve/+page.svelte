<script lang="ts">
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type { AssistantConversationMessage, ChatWindowComponentArgs, CodeEditorComponentArgs, DefaultLayoutTerminalComponentArgs, InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import type { ProblemDetailsDto } from '$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs';
	import ChatWindow from '$lib/Components/ComponentTrees/IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp3/ChatWindow.svelte';
	import { activeProfile } from '$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte';
	import type { AssistantWizardControlPanelArgs, ComponentConfig, Label, Meta, MyTopLevelComponentArg, WizardComponentArg } from '$lib/Components/GenericComponents/layoutManager/ResizableComponentArg';
	import WizardComponent from '$lib/Components/GenericComponents/layoutManager/WizardComponent.svelte';
	import type { ChatList } from '$lib/types/domain/modules/problem/assistant';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';
	import type { SolvePageLoadArgs } from '$lib/types/ui/modules/problem/solvePageLoadArgs';
	import Ide from './Ide.svelte';
	import { onMount } from 'svelte';

	
	let { data = $bindable() }: { data: SolvePageLoadArgs } = $props();
	
	let config = $state<Record<string, DefaultLayoutTerminalComponentArgs>>({});

	type testCaseInsertResp = {
		modifiedCodeB64: string
	}

	let loadedData: StandardResponseDto<ProblemDetailsDto> = $state({} as StandardResponseDto<ProblemDetailsDto>)
	let loadedChatData: StandardResponseDto<ChatList> = $state({} as StandardResponseDto<ChatList>)

		
	onMount(async () => {
		activeProfile.profile = "placeholder";
		loadedData = await data.problemLoadResponse;
		loadedChatData = await data.chatList;
		config = {
			'code-editor': { templateContents: loadedData.body.templateContents } as CodeEditorComponentArgs,
			'terminal-comp':  { terminalContents: '' } as TerminalComponentArgs,
			'problem-info':  (await data.problemLoadResponse).body as InfoPanelComponentArgs,
			'test-cases-comp':  { 
				testCases: loadedData.body.testCases,
				InsertTestCase: insertTestCase
			} as TestCaseComponentArgs,
			'assistant-wizard': {
				components: loadedChatData.body.chats.map(c => {
					return {
						compId: `${c.chatName}-comp-wrapper`,
						component: "TopLevelComponent",
						options: {
							component: {
								compId: `${c.chatName}-comp`,
								component: "ChatWindow",
								options: {},
								meta: {
									label: {
										commonName: c.chatName,
										labelFor: `${c.chatName}-comp`
									}
								}
							}
						}
					} as ComponentConfig<MyTopLevelComponentArg<ChatWindowComponentArgs>>
				})
			} as Partial<WizardComponentArg>
		}
		activeProfile.profile = "default";
	});
	
	let contextInjectors: Record<string, (target: DefaultLayoutTerminalComponentArgs) => void> = $derived({
		"ChatWindow" : (target: DefaultLayoutTerminalComponentArgs) => {
			(target as ChatWindowComponentArgs).problemId = (config['problem-info'] as InfoPanelComponentArgs).problemId;
			(target as ChatWindowComponentArgs).getUserCode = () => (config['code-editor'] as CodeEditorComponentArgs).templateContents;
		},
		"AssistantWizardControlPanel" : ( target: DefaultLayoutTerminalComponentArgs ) => {
			(target as AssistantWizardControlPanelArgs).addInsertedComponentToRoot = (compId: string) => {
				if (config[compId] === undefined){
					config[compId] = {}
					return true;
				}
				return true;
			}
		}
	});

	// $inspect(config);

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
	<Ide {contextInjectors} bind:components={config} />
</main>