<script lang="ts">
	import { FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type { AssistantConversationMessage, ChatWindowComponentArgs, CodeEditorComponentArgs, DefaultLayoutTerminalComponentArgs, InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import type { AutoSaveDto, ProblemDetailsDto } from '$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs';
	import { activeProfile } from '$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte';
	import type { ComponentConfig, ControlPanelArgs, InsertData, Label, Meta, MyTopLevelComponentArg, WizardComponentArg } from '$lib/Components/GenericComponents/layoutManager/ResizableComponentArg';
	import type { ChatList, ChatMessage } from '$lib/types/domain/modules/problem/assistant';
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
	let loadedAutoSave: StandardResponseDto<AutoSaveDto | undefined> = $state({} as StandardResponseDto<AutoSaveDto | undefined>);


	onMount(async () => {
		activeProfile.profile = "placeholder";
		loadedData = await data.problemLoadResponse;
		loadedChatData = await data.chatList;
		loadedAutoSave = await data.autoSave;

		console.log(loadedAutoSave.body);

		config = {
			'code-editor': { 
				userCode: loadedAutoSave?.body?.userCodeB64 !== undefined && atob(loadedAutoSave.body.userCodeB64).trim() !== "" ? atob(loadedAutoSave!.body!.userCodeB64) : loadedData.body.templateContents,
				problemId: loadedData.body.problemId,
				templateContents: loadedData.body.templateContents
			 } as CodeEditorComponentArgs,
			'terminal-comp':  { stdOut: '', stdErr: '' } as TerminalComponentArgs,
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
								options: {
									chatName: c.chatName,
									chatId: c.chatId,
									problemId: loadedData.body.problemId,
									pages: [] as CustomPageData<ChatMessage>[]
								} as ChatWindowComponentArgs,
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

	// $inspect(config);



	let contextInjectors: Record<string, (target: DefaultLayoutTerminalComponentArgs) => void> = $derived({
		"ChatWindow" : (target: DefaultLayoutTerminalComponentArgs) => {
			(target as ChatWindowComponentArgs).problemId = (config['problem-info'] as InfoPanelComponentArgs).problemId;
			(target as ChatWindowComponentArgs).getUserCode = () => (config['code-editor'] as CodeEditorComponentArgs).templateContents;
		},
		"AssistantWizardControlPanel" : ( target: DefaultLayoutTerminalComponentArgs ) => {
			(target as ControlPanelArgs).controlCallbacks = {
				...(target as ControlPanelArgs).controlCallbacks,	
				addInsertedComponentToRoot: (compId: string) => {
					if (config[compId] === undefined){
						config[compId] = {}
					}
				},
				checkIfHasNewComponent: (): boolean => {
					return (config['assistant-wizard'] as WizardComponentArg).components
					.filter(comp => comp.options.component.component === "ChatWindow")
					.map(comp => comp.options.component.options as ChatWindowComponentArgs)
					.some(args => ((args?.pages?.length ?? 0) === 0) && (args?.chatName === undefined));
				},
				insert: (InsertData: InsertData) => {
					(config['assistant-wizard'] as WizardComponentArg).components.unshift({
						compId: `${InsertData.compId}-wrapper`,
						component: "TopLevelComponent",
						options: {
							component: {
							compId: InsertData.compId,
							component: InsertData.compType,
							options: InsertData.compArgs ?? {},
							meta: {
								label: {
								labelFor: InsertData.compId,
								commonName: InsertData.compCommonName
								}
							}
							}
						},
					} as ComponentConfig<MyTopLevelComponentArg<any>>)
				},
				remove: async (compId: string): Promise<boolean> => {
					/* TODO: Do server call here */
					let removedWindow: ChatWindowComponentArgs | undefined = (config['assistant-wizard'] as WizardComponentArg).components
					.filter(comp => comp.options.component.component === "ChatWindow")
					.map(comp => comp.options.component.options as ChatWindowComponentArgs)
					.at(0);

					(config['assistant-wizard'] as WizardComponentArg).components = (config['assistant-wizard'] as WizardComponentArg).components.filter(comp => comp.options.component.compId !== compId);

					if (!removedWindow || !removedWindow?.chatId || removedWindow.pages.length === 0){
						return true;						
					}

					let res: StandardResponseDto<{messagesDeleted: number}> = await FetchFromApi<{messagesDeleted: number}>("DeleteChat", {
						method: "DELETE",
					}, fetch, new URLSearchParams({ chatId: removedWindow.chatId }))

					return true;
				},
				rename: async (compId: string, newName: string): Promise<void> => {
					let comp: ComponentConfig<MyTopLevelComponentArg<any>> | undefined = (config['assistant-wizard'] as WizardComponentArg).components.find(comp => comp.options.component.compId === compId);
					if (!comp?.options.component.meta?.label) return;
					comp.options.component.meta.label.commonName = newName;
					const prevChatName: string | undefined = (comp.options.component.options as ChatWindowComponentArgs).chatName;
					const chatId: string | undefined = (comp.options.component.options as ChatWindowComponentArgs).chatId;

					if (prevChatName){
						let res = await FetchFromApi("UpdateChatName", {
							method: "PUT",
							body: JSON.stringify({
								chatId: chatId,
								newChatName: newName,
								problemId: loadedData.body.problemId 
							})
						}, fetch);
						console.log(res);
					}
					(comp.options.component.options as ChatWindowComponentArgs).chatName = newName;
				}
			};
		}
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
	<Ide {contextInjectors} bind:components={config} />
</main>