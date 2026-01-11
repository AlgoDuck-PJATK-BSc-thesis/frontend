<script lang="ts">
	import { ApiError, type StandardResponseDto } from "$lib/api/apiCall";
	import { toast } from "$lib/Components/Notifications/ToastStore.svelte";
	import type { LayoutCreationResultDto } from "./EditorEditorTypes";

    let { options = $bindable() }: { options: { isVisible: boolean, onclick: (name: string) => Promise<StandardResponseDto<LayoutCreationResultDto> | undefined> } } = $props()

    let layoutName: string = $state("");

    let isResultSuccess: boolean | undefined = $state()
    let countdown: number = $state(5)
    let countdownInterval: ReturnType<typeof setInterval> | null = $state(null)

    const startCountdown = () => {
        countdown = 5;
        countdownInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownInterval!);
                history.back();
            }
        }, 1000);
    }

    const cancelRedirect = () => {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        isResultSuccess = undefined;
    }
</script>

<main class="w-full h-full fixed inset-0 bg-black/50 flex justify-center items-center">
    <div class="rounded-lg border border-ide-accent/10 bg-ide-card p-5 flex flex-col items-center gap-6 shadow-7xl">
        <div class="flex flex-col gap-1 w-full">
            <div class="w-full flex flex-row justify-start">
                <span>Layout name</span>
            </div>
            <input bind:value={layoutName} class="bg-ide-bg rounded-md text-ide-text-primary w-full" type="text" name="" id=""/>
        </div>
        <div class="w-full flex flex-row justify-center gap-5">
            <button onclick={() => {
                options.isVisible = false;
            }} class="px-18 py-3 bg-ide-dcard/50 hover:bg-ide-dcard rounded-md border border-ide-accent/5">
                Cancel
            </button>
            <button onclick={async () => {
                let res = await options.onclick(layoutName);
                if (res?.status === "Success") {
                    isResultSuccess = true;
                    startCountdown();
                }
            }} disabled={layoutName.length < 3} class="px-18 py-3 bg-ide-dcard/50 hover:bg-ide-dcard rounded-md border border-ide-accent/5">
                Save
            </button>
        </div>
        {#if isResultSuccess}
            <div class="p-2 rounded-lg border border-green-400">
                <div class="p-2 rounded-lg bg-green-100/20 flex flex-col items-center gap-3">
                    <div class="flex items-center gap-2">
                        <span>Layout creation successful. Redirecting in</span>
                        <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold text-lg tabular-nums">
                            {countdown}
                        </span>
                    </div>
                    <div class="w-full bg-green-900/30 rounded-full h-1.5 overflow-hidden">
                        <div 
                            class="h-full bg-green-400 transition-all duration-1000 ease-linear"
                            style="width: {(countdown / 5) * 100}%"
                        ></div>
                    </div>
                    <button 
                        onclick={cancelRedirect}
                        class="text-sm text-green-300 hover:text-green-100 underline underline-offset-2"
                    >
                        Cancel redirect
                    </button>
                </div>
            </div>
        {/if}
    </div>
</main>