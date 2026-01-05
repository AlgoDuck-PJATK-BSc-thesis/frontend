<script lang='ts'>
    let { toggled = $bindable() }: { toggled: boolean } = $props();
</script>

<main class="w-full h-full rounded-full bg-admin-bg-input overflow-hidden">
    <button aria-label="toggle" onclick={() => {toggled = !toggled} } class="w-full h-full relative p-[5%]">
        <div class="h-full transition-all ease-out duration-200 aspect-square pointer-events-none absolute top-0 rounded-full bg-admin-text-primary {toggled ? "right-0" : "left-0"}">

        </div>
    </button>
</main>