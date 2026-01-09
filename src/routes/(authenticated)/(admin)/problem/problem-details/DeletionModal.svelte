<script lang='ts'>
	import { clickOutside } from "$lib/actions/clickOutside";
	import { FetchFromApi, type StandardResponseDto } from "$lib/api/apiCall";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";
	import TickIconSvg from "$lib/svg/EditorComponentIcons/TickIconSvg.svelte";
	import ErrorIconSvg from "$lib/svg/Toast/ErrorIconSvg.svelte";
	import SuccessIconSvg from "$lib/svg/Toast/SuccessIconSvg.svelte";

    let { isVisible = $bindable(), problemId }: { isVisible: boolean, problemId: string } = $props();

    type DeleteProblemResult = {
        problemId: string
    }

    let isDeletingProblem: boolean = $state(false);
    let deleteProblemResult: { wasDeleted: boolean, message: string } | undefined = $state();
    let inputFieldContents: string = $state("");
    const deleteProblem = async () => {
        FetchFromApi<DeleteProblemResult>("DeleteProblem", {
            method: "DELETE"
        }, fetch, new URLSearchParams({ problemId: problemId })).then((value: StandardResponseDto<DeleteProblemResult>) => {
            deleteProblemResult = { wasDeleted: value.status === "Success", message: value.message || "Problem deleted sucesfully" }
        }).catch((err) => {
            deleteProblemResult = { wasDeleted: false, message: err };
        })
    }
</script>

<main class="bg-black/25 w-screen h-screen fixed inset-0 flex justify-center items-center">
    <div use:clickOutside={() => isVisible = false} class="w-120 relative flex flex-col bg-admin-bg-secondary gap-4 border border-admin-border-primary rounded-xl p-5 pb-1">
        <button onclick={() => isVisible = false} class="absolute w-6 h-6 p-0.5 top-2 right-2 hover:bg-admin-bg-hover hover:stroke-admin-text-secondary transition-colors ease-out duration-200 rounded-md">
            <CrossIconSvg options={{ class:'w-full h-full stroke-admin-text-muted stroke-[2]'}}/>
        </button>
        <h3 class="text-lg text-admin-text-primary border-b border-b-admin-border-primary py-1">Delete problem</h3>
        <div class="flex flex-col gap-2">
            <span class="text-sm">problem <i>{problemId}</i> will be deleted.<br/> This action is <strong class="text-admin-danger-text">Irreversable</strong></span>
            <div class="w-full flex flex-col">
                <input bind:value={inputFieldContents} type="text" class="bg-admin-bg-input w-full rounded-md">
                <span class="px-2 w-full flex justify-end font-semibold whitespace-pre text-xs">To confirm type <i>delete</i> in the text input field</span>
            </div>

            <div class="w-full text-sm flex-row gap-1 flex justify-end py-2">
                <button onclick={() => isVisible = false} class="h-10 px-8 transition-colors duration-300 ease-out rounded-md hover:bg-admin-bg-hover">Cancel</button>
                <button onclick={deleteProblem} disabled={isDeletingProblem || inputFieldContents !== "delete"} class="h-10 bg-admin-danger-bg transition-colors disabled:bg-admin-danger-bg/50 disabled:cursor-not-allowed disabled:text-admin-text-muted duration-300 ease-out hover:bg-admin-danger-bg-hover px-8 rounded-md">
                    {#if !isDeletingProblem}
                        <span>Delete</span>
                    {:else}
                        <div class="w-full flex flex-row gap-1 items-center">
                            <div class="w-4 h-4 border-t-admin-text-muted border-t-2 animate-spin"></div>
                            <span class="text-admin-text-muted text-sm">Deleting</span>
                        </div>
                    {/if}
                </button>
            </div>

            {#if deleteProblemResult}
                <div class="w-full flex flex-row min-h-10 items-center p-3 rounded-lg {deleteProblemResult.wasDeleted ? "bg-admin-success/20" : "bg-admin-danger-bg/20"}">
                    {#if deleteProblemResult.wasDeleted}
                        <SuccessIconSvg options={{ class: 'w-6 h-6 stroke-admin-success stroke-[2]'}}/>
                    {:else}
                        <ErrorIconSvg options={{ class: 'w-6 h-6 stroke-admin-danger-bg stroke-[2]'}}/>
                    {/if}
                    <div class="grow text-sm">
                        <p>{deleteProblemResult.message}</p>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</main>