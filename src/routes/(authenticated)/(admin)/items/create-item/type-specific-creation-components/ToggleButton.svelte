<script lang='ts'>
	import EyeIconsClosedSvg from "$lib/svg/EditorComponentIcons/EyeIconsClosedSvg.svelte";
	import EyeIconSvg from "$lib/svg/EditorComponentIcons/EyeIconSvg.svelte";

    let { options }: { options: { toggle: (() => void) } } = $props();
    let isToggled: boolean = $state(false)
</script>

<button onclick={() => {
    isToggled = !isToggled;
    options.toggle();
}} class="p-1 hover:bg-admin-text-muted/20 rounded-[20%] duration-200 ease-out transition-colors">
    {#if isToggled}
        <EyeIconSvg options={{ class: 'w-6 h-6 stroke-[2] stroke-admin-text-muted' }}/>
    {:else}
        <EyeIconsClosedSvg options={{ class: 'w-6 h-6 stroke-[2] stroke-admin-text-muted' }}/>        
    {/if}
</button>