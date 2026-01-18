<script lang="ts">
	import Monaco from "$lib/Components/GenericComponents/monaco/monaco.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import { Editor } from "@tiptap/core";
	import Placeholder from "@tiptap/extension-placeholder";
	import StarterKit from "@tiptap/starter-kit";
	import { 
		type problemCreationDto, 
		type TagCreateDto, 
		type TestCaseCreateDto, 
		type ValidationResponse, 
		type ValidationResponseStatus,
		type CreateUnverifiedProblemDto, 
		isTerminalValidationStatus

	} from "./TestCase";
	import TestCaseComp from "./TestCaseComp.svelte";
	import TipTapWithMd from "./TipTapWithMd.svelte";
	import { API_URL, FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
    import * as signalR from '@microsoft/signalr';
	import type { CategoryDto, ProblemCreatePageArgs } from "./problemAddTypes";
	import ToolTip from "./ToolTip.svelte";
	import DropDownSelect2 from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelect2.svelte";
	import DifficultySelectCard from "./SuggestionCards/DifficultySelectCard.svelte";
	import type { KeyValuePair } from "$lib/Components/GenericComponents/dropDownMenu/DropDownSelectOptions";
	import ErrorIconSvg from "$lib/svg/Toast/ErrorIconSvg.svelte";
	import TickIconSvg from "$lib/svg/EditorComponentIcons/TickIconSvg.svelte";

    let { data }: { data: ProblemCreatePageArgs } = $props();

    let tiptapEditor: Editor;

    const isInEditMode: boolean = data.loadedCreateDto !== undefined && data.isEditMode;
    
    let creationDto: problemCreationDto = $state(data.loadedCreateDto ??  {
        templateB64: "public class Solution{\n\t// your problem setup goes here\n}",
        testCases: [] as TestCaseCreateDto[],
        tags: [] as TagCreateDto[],
        difficultyId: '',
        categoryId: '',
        problemTitle: '',
        problemDescription: ''
    } as problemCreationDto)

    let connection: signalR.HubConnection | undefined;
	let connected: boolean = $state(false);

    let currentValidationStatus: ValidationResponseStatus | undefined = $state();
    let validationHistory: ValidationResponse[] = $state([]);
    let submissionError: string | undefined = $state();
    let createdProblemId: string | undefined = $state();

    let formValidation = $derived.by(() => {
        const errors: string[] = [];
        
        if (!creationDto.problemTitle?.trim()) errors.push("Problem title is required");
        if (!creationDto.problemDescription?.trim()) errors.push("Problem description is required");
        if (!creationDto.difficultyId) errors.push("Please select a difficulty");
        if (!creationDto.categoryId) errors.push("Please select a category");
        if (creationDto.testCases.length === 0) errors.push("At least one test case is required");
        
        const incompleteTestCases = creationDto.testCases.filter((tc, i) => !tc.callMethod || !tc.expected);
        creationDto.testCases
            .map((tc, i) => ({testCase: tc, testCaseIndex: i}))
            .filter((tc) => tc.testCase.callMethod && (tc.testCase.callMethod.functionParams ?? []).length !== (tc.testCase.callArgs ?? 0).length)
            .forEach((tc) => errors.push(`test case: ${tc.testCaseIndex}. Missing call function arguments.`));

        if (incompleteTestCases.length > 0) {
            errors.push(`${incompleteTestCases.length} test case(s) are incomplete`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    });

    const createProblem = async () => {
        if (!formValidation.isValid) {
            submissionError = formValidation.errors.join(". \n");
            return;
        }

        submissionError = undefined;
        validationHistory = [];
        currentValidationStatus = "Queued";
        createdProblemId = undefined;

        try {
            let problemCreationDto: problemCreationDto = {
                ...creationDto,
                templateB64: btoa(creationDto.templateB64),
                testCases: creationDto.testCases.map(t => ({
                    ...t,
                    arrangeB64: btoa(t.arrangeB64) 
                }))
            }

            let res: StandardResponseDto<CreateUnverifiedProblemDto>;


            if (isInEditMode && data.problemId){
                console.log(problemCreationDto);
                res = await FetchFromApi<CreateUnverifiedProblemDto>("UpdateProblem", {
                    method: 'PUT',
                    body: JSON.stringify(problemCreationDto)
                }, fetch, new URLSearchParams({ problemId: data.problemId }));
            }else{
                res = await FetchFromApi<CreateUnverifiedProblemDto>("CreateProblem", {
                    method: 'POST',
                    body: JSON.stringify(problemCreationDto)
                });
            }

            if (!res.body?.jobId) {
                throw new Error("Failed to create problem - no job ID returned");
            }

            const jobId: string = res.body.jobId;
            createdProblemId = res.body.problemId;

            connection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_URL}/hubs/validation-status`, {
                    withCredentials: true
                })
                .withAutomaticReconnect()
                .build();
            
            connection.on("ValidationStatusUpdated", (validationResponse: StandardResponseDto<ValidationResponse>) => {
                validationHistory.push(validationResponse.body);
                currentValidationStatus = validationResponse.body.status;
            
                if (isTerminalValidationStatus(validationResponse.body.status)) connection?.stop()

            });

            connection.onclose((error) => {
                connected = false;
                if (error && currentValidationStatus === "Pending") {
                    submissionError = "Connection to validation server lost";
                }
            });
            
            try {
                await connection.start();
                connected = true;
                
                let jobData: StandardResponseDto<ValidationResponse[]> | null = await connection.invoke<StandardResponseDto<ValidationResponse[]> | null>("SubscribeToJob", { jobId: jobId });
                validationHistory.push(...(jobData?.body ?? []))
            } catch (err) {
                connected = false;
                submissionError = "Failed to connect to validation server";
            }
        } catch (err) {
            submissionError = err instanceof Error ? err.message : "Failed to create problem";
        }
    }


    const removeTestCase = (index: number) => {
        creationDto.testCases = creationDto.testCases.filter((_, i) => i !== index);
    }

    const initTimeSelectedCategory: CategoryDto | undefined = data.categories.find(dc => dc.categoryId === creationDto.categoryId)
    const firstCategory: CategoryDto | undefined = data.categories.at(0);
</script>

<main class="w-full grow bg-admin-bg-primary text-admin-text-muted font-sans">
    <div class="max-w-6xl mx-auto p-6 flex flex-col gap-6 overflow-y-auto">
        <div class="py-4 border-b border-admin-bg-input mb-2">
            <h2 class="text-2xl font-normal text-admin-text-primary tracking-tight">Add Problem</h2>
        </div>

        <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
            <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Problem Title</h3>
                <span class="text-admin-danger-text text-xs">*</span>
            </div>
            <div class="p-4">
                <div {@attach node => {
                    tiptapEditor = new Editor({
                    element: node,
                    content: data.loadedCreateDto?.problemTitle ?? "",
                    extensions: [
                        StarterKit,
                        Placeholder.configure({
                            placeholder: 'Example: Linked list cycle detection'
                        })
                    ],
                    onTransaction: () => {
                        tiptapEditor = tiptapEditor; 
                    },
                    onUpdate: ({ editor }) => {
                        creationDto.problemTitle = editor.getText()
                    },
                    editorProps: {
                        handleKeyDown: (view, event) => {}
                    }
                });

                return () => {
                    tiptapEditor?.destroy()
                }
                }} class="w-full min-h-[40px] bg-admin-bg-input border border-admin-bg-input rounded-sm px-3 py-2 text-admin-text-muted text-sm focus-within:border-[#007fd4] transition-colors [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-[#858585] [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                    <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Difficulty</h3>
                    <span class="text-admin-danger-text text-xs">*</span>
                </div>
                <div class="p-4 items-center">
                    <div class="flex flex-row items-center gap-1 bg-admin-border-primary rounded-full p-1">
                        {#each data.difficulties as difficulty}
                            <button onclick={() => {
                                creationDto.difficultyId = difficulty.id
                            }} class="px-3 w-full py-2 rounded-full text-xs transition-all
                                {creationDto.difficultyId === difficulty.id ? 'bg-admin-accent-primary text-white font-medium' : 'text-admin-text-muted hover:text-admin-text-secondary'}">
                                <span>{difficulty.name}</span>
                            </button>
                        {/each}
                    </div>
                    {#if data.difficulties.length === 0}
                        <p class="text-sm text-[#858585] italic">No difficulties available</p>
                    {/if}
                </div>
            </div>

            <div class="bg-admin-bg-secondary border border-admin-bg-input rounded">
                <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                    <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Category</h3>
                    <span class="text-admin-danger-text text-xs">*</span>
                </div>
                <div class="p-4 w-full flex justify-center">
                    <DropDownSelect2 options={{
                        options: data.categories.map(c => ({key: c, value: c.categoryId} as KeyValuePair<CategoryDto, string>)),
                        onSelectCallback: (selected: string) => {
                            creationDto.categoryId = selected
                        },
                        displayComp: DifficultySelectCard,
                        groupId: 'somegroup',
                        defaultSelected: initTimeSelectedCategory ? { key: initTimeSelectedCategory, value: initTimeSelectedCategory.categoryId } : firstCategory ? { key: firstCategory, value: firstCategory.categoryId } : undefined
                    }}/>
                </div>
            </div>
        </div>

        <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
            <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Problem Description</h3>
                <span class="text-admin-danger-text text-xs">*</span>
            </div>
            <div class="p-4">
                <TipTapWithMd bind:editorContents={creationDto.problemDescription}/>    
            </div>
        </div>

        <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
            <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Problem Template</h3>
                <ToolTip options={{ tip: "The Java template code that users will start with" }}/>
            </div>
            <div class="h-56">
                <Monaco bind:editorContents={creationDto.templateB64}/>
            </div>
        </div>

        <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                <div class="flex items-center gap-2.5">
                    <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Test Cases</h3>
                    <span class="text-admin-danger-text text-xs">*</span>
                    <span class="text-[10px] font-semibold text-[#858585] bg-[#37373d] px-1.5 py-0.5 rounded-full">
                        {creationDto.testCases.length}
                    </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-[#858585]">
                    <span class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-[#89d185]"></span>
                        Public: {creationDto.testCases.filter(tc => tc.isPublic).length}
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-[#858585]"></span>
                        Non-public: {creationDto.testCases.filter(tc => !tc.isPublic).length}
                    </span>
                </div>
            </div>
            <div class="p-4 flex flex-col gap-3">
                {#each creationDto.testCases as _, i}
                    <TestCaseComp 
                        mountExpanded={!isInEditMode}
                        templateContents={creationDto.templateB64} 
                        testCaseNum={i} 
                        bind:testCase={creationDto.testCases[i]}
                        onRemove={() => removeTestCase(i)}
                    />
                {/each}
                <button onclick={() => {
                    creationDto.testCases.push({
                        isPublic: true,
                        orderMatters: true
                    } as TestCaseCreateDto)
                }} class="flex items-center justify-center gap-2 px-5 py-2.5 bg-admin-accent-primary text-white border-none rounded-sm text-sm font-medium cursor-pointer transition-colors hover:bg-admin-accent-primary-hover focus:outline-[#007fd4] focus:outline-offset-2 self-start">
                    <CrossIconSvg options={{class: "w-3.5 h-3.5 stroke-white stroke-2 rotate-45"}}/>
                    <span>Add Test Case</span>
                </button>
            </div>
        </div>

        <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
            <div class="flex flex-row items-center justify-between gap-5 p-5">
                {#if currentValidationStatus === "Succeeded" && createdProblemId}
                    <div class="flex flex-row gap-2 justify-start p-2 items-center bg-[#89d185]/20 rounded-xl grow">
                        <TickIconSvg options={{ class: 'w-6 h-6 stroke-[2] stroke-[#89d185]'}}/>
                        <span class="text-sm text-[#89d185]">
                            Problem {isInEditMode ? 'updated' : 'created'} successfully!
                        </span>
                        <a href={`./problem-details?problemId=${createdProblemId}`} class="text-sm text-admin-accent-primary hover:underline ml-2">
                            View problem
                        </a>
                    </div>
                {:else if submissionError || validationHistory.some(ve => ve.status === "Failed")}
                    <div class="flex flex-row gap-2 justify-start p-2 items-center bg-admin-danger-text/50 rounded-xl grow">
                        <ErrorIconSvg options={{ class: 'w-6 h-6 stroke-[2] stroke-admin-danger-text' }}/>
                        {#if submissionError}
                            <span class="text-sm text-admin-danger-text whitespace-pre ">{submissionError}</span>
                        {:else}
                            {@const serverSideValidationError = validationHistory.find(ve => ve.status === "Failed")}
                            <span class="text-sm text-admin-danger-text whitespace-pre ">{serverSideValidationError?.message}</span>
                        {/if}
                    </div>
                {:else}
                    <div class="flex flex-col gap-1">
                        {#if !formValidation.isValid}
                            <span class="text-xs text-[#cca700]">
                                {formValidation.errors.length} issue{formValidation.errors.length !== 1 ? 's' : ''} to resolve
                            </span>
                        {:else}
                            <span class="text-xs text-[#89d185]">Ready to submit</span>
                        {/if}
                    </div>
                {/if}
                
                
                <button onclick={createProblem} 
                    disabled={currentValidationStatus === "Pending" || currentValidationStatus === "Queued"}
                    class="flex items-center justify-center gap-2 px-6 py-3 bg-admin-accent-primary text-white border-none rounded-sm text-sm font-medium cursor-pointer transition-colors hover:bg-admin-accent-primary-hover focus:outline-[#007fd4] focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-admin-accent-primary">
                    {#if currentValidationStatus === "Pending" || currentValidationStatus === "Queued"}
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{currentValidationStatus}</span>
                    {:else}
                        <span>{isInEditMode ? "Update" : "Create"} Problem</span>
                    {/if}
                </button>
            </div>
        </div>
    </div>
</main>