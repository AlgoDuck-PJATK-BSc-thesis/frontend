<script lang="ts">
	import { ApiError, FetchFromApi, type StandardResponseDto } from '$lib/api/apiCall';
	import type { AssistantConversationMessage, ChatWindowComponentArgs, CodeEditorComponentArgs, DefaultLayoutTerminalComponentArgs, InfoPanelComponentArgs, TerminalComponentArgs, TestCaseComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import type { AutoSaveDto, ProblemDetailsDto } from '$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs';
	import { activeProfile } from '$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte';
	import type { ComponentConfig, ControlPanelArgs, InsertData, Label, Meta, MyTopLevelComponentArg, WizardComponentArg } from '$lib/Components/GenericComponents/layoutManager/ResizableComponentArg';
	import type { ChatList, ChatMessage } from '$lib/types/domain/modules/problem/assistant';
	import type { CustomPageData } from '$lib/types/domain/Shared/CustomPageData';
	import type { SolvePageLoadArgs } from '$lib/types/ui/modules/problem/solvePageLoadArgs';
	import DefaultLayout from '$lib/Components/ComponentTrees/IdeComponentTree/default-layout.json'

	import Ide from './Ide.svelte';
	import { onMount } from 'svelte';
	import type { EditorConfigData } from './types';
	import { userEditorPreferences } from '$lib/stores/theme.svelte';
	import { toast } from '$lib/Components/Notifications/ToastStore.svelte';
	import { applyThemeEditor, type EditorThemeName } from '$lib/Themes';

	let { data = $bindable() }: { data: SolvePageLoadArgs } = $props();
	
	let config = $state<Record<string, DefaultLayoutTerminalComponentArgs>>({});

	type testCaseInsertResp = {
		modifiedCodeB64: string
	}

	let loadedData: StandardResponseDto<ProblemDetailsDto> = $state({} as StandardResponseDto<ProblemDetailsDto>)
	let loadedChatData: StandardResponseDto<ChatList> = $state({} as StandardResponseDto<ChatList>)
	let loadedAutoSave: StandardResponseDto<AutoSaveDto | undefined> = $state({} as StandardResponseDto<AutoSaveDto | undefined>);

$inspect(loadedData);

	onMount(async () => {
		activeProfile.profile = "placeholder";
		data.autoSave.then((value: StandardResponseDto<AutoSaveDto | undefined>) => {
			loadedAutoSave = value;
		}).catch((reason: any) => {
			// well this is a 404 if the user is new to the problem so... Ignored???
		})
		loadedData = await data.problemLoadResponse;
		loadedChatData = await data.chatList;
		
		data.configData.then((data: StandardResponseDto<EditorConfigData>) => {
			userEditorPreferences.layout = data.body.layout;
			userEditorPreferences.fontSize = data.body.fontSize;
			userEditorPreferences.theme = data.body.theme;
			applyThemeEditor(userEditorPreferences.theme.themeName as EditorThemeName)
		}).catch((err) => {
			toast.warning('failed loading editor config. Falling back to default');
		})


		config = {
			'code-editor': { 
				userCode: loadedAutoSave?.body?.userCodeB64 !== undefined && atob(loadedAutoSave.body.userCodeB64).trim() !== "" ? atob(loadedAutoSave!.body!.userCodeB64) : loadedData.body.templateContents,
				problemId: loadedData.body.problemId,
				templateContents: loadedData.body.templateContents,
				isDetachedHeadMode: false,
				restoreTemplate: () => {
					const templateCapture = loadedData.body.templateContents;
					(config['code-editor'] as CodeEditorComponentArgs).upstreamChanged = true;
    				(config['code-editor'] as CodeEditorComponentArgs).userCode = templateCapture;
				}
			 } as CodeEditorComponentArgs,
			'terminal-comp':  { 
				stdOut: '',
				stdErr: '',
				status: undefined
			} as TerminalComponentArgs,
			'problem-info':  (await data.problemLoadResponse).body as InfoPanelComponentArgs,
			'test-cases-comp':  { 
				isFileTreeOpen: true,
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
								compId: `${c.chatId}`,
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
										labelFor: `${c.chatId}`
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
			(target as ChatWindowComponentArgs).problemId = loadedData.body?.problemId;
			(target as ChatWindowComponentArgs).getUserCode = () => {
				const userCode: string | undefined = (config['code-editor'] as CodeEditorComponentArgs)?.userCode; 
				const templateCode: string | undefined = (config['code-editor'] as CodeEditorComponentArgs)?.templateContents; 
				const lastAutoSaveCode: string | undefined = loadedAutoSave?.body?.userCodeB64;
				if (userCode)
					return userCode;
				if (lastAutoSaveCode)
					return lastAutoSaveCode;
				if (templateCode) 
					return templateCode;
				return "could not retrieve user code";
			};
			(target as ChatWindowComponentArgs).changeLabel = (id: string, newLabel: string) => {
				const components = (config['assistant-wizard'] as WizardComponentArg).components;
				const comp = components.find(c => c.options.component.compId === id);
				
				if (comp?.options?.component?.meta?.label) {
					comp.options.component.meta.label.commonName = newLabel;
				}
			}
		},
		"AssistantWizardControlPanel" : ( target: DefaultLayoutTerminalComponentArgs ) => {
			(target as ControlPanelArgs).controlCallbacks = {
				...(target as ControlPanelArgs).controlCallbacks,	
				addInsertedComponentToRoot: (compId: string, compOptions: Record<string, any>) => {
					if (config[compId] === undefined){
						config[compId] = compOptions;
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
					(config['assistant-wizard'] as WizardComponentArg).components = (config['assistant-wizard'] as WizardComponentArg).components.filter(comp => comp.options.component.compId !== compId);

					let didDelete = false
					FetchFromApi<{ messagesDeleted: number }>("DeleteChat", {
						method: "DELETE",
					}, fetch, new URLSearchParams({ chatId: compId })).then(() => {
						didDelete = true;
					}).catch(() => {
						didDelete = false;
					})

					return didDelete;
				},
				rename: async (compId: string, newName: string): Promise<void> => {
					let comp: ComponentConfig<MyTopLevelComponentArg<any>> | undefined = (config['assistant-wizard'] as WizardComponentArg).components.find(comp => comp.options.component.compId === compId);
					if (!comp?.options.component.meta?.label) return;
					comp.options.component.meta.label.commonName = newName;
					const prevChatName: string | undefined = (comp.options.component.options as ChatWindowComponentArgs).chatName;
					const chatId: string | undefined = (comp.options.component.options as ChatWindowComponentArgs).chatId;

					if (prevChatName){
						try{
							let res = await FetchFromApi("UpdateChatName", {
								method: "PUT",
								body: JSON.stringify({
									chatId: chatId,
									newChatName: newName,
									problemId: loadedData.body.problemId 
								})
							}, fetch);
							(comp.options.component.options as ChatWindowComponentArgs).chatName = newName;

						}catch(err){
															console.log("err here");
								console.log(err);
								console.log("err here");
							if (err instanceof ApiError){

								const error: ApiError = err as ApiError;
								if (error.response.status === "Error" && error.response.message){
									toast.error(error.response.message)
								}
							}else{
								console.log("nope");
							}
						}
						
					}
				},
				getProblemId: () => {
					return loadedData.body.problemId
				}
			};
		}
	});

  const insertTestCase = async (testCaseId: string) => {
    let res = await FetchFromApi<testCaseInsertResp>("problem/test-case", {
      method: "POST",
      body: JSON.stringify({
        userCodeB64: btoa((config['code-editor'] as CodeEditorComponentArgs).templateContents),
        exerciseId: loadedData.body.problemId,
        testCaseId: testCaseId
      })
    });
	if (!res?.body) return

	(config['code-editor'] as CodeEditorComponentArgs).upstreamChanged = true;
    (config['code-editor'] as CodeEditorComponentArgs).userCode = atob(res.body.modifiedCodeB64);
  } 

</script>

<main class="w-full h-[100vh] bg-ide-bg">
	<Ide {contextInjectors} bind:components={config} />
</main>

<svelte:head>
	<title>Problem - Algoduck</title>
</svelte:head>