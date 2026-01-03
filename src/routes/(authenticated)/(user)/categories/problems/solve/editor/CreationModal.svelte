<script lang="ts">
    let { options = $bindable() }: { options: { isVisible: boolean, onclick: (name: string) => Promise<void> } } = $props()

    let layoutName: string = $state("");
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
                await options.onclick(layoutName);
            }} class="px-18 py-3 bg-ide-dcard/50 hover:bg-ide-dcard rounded-md border border-ide-accent/5">
                Save
            </button>
        </div>
    </div>
</main>

