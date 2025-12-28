<script lang="ts">
    import type { TerminalComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import TerminalIconSvg from "$lib/svg/EditorComponentIcons/TerminalIconSvg.svelte";
	import { isIntermediateStatus, isTerminalStatus } from "$lib/types/domain/modules/problem/solve";
    let { options = $bindable() }: { options: TerminalComponentArgs } = $props();

    // $inspect(isTerminalStatus(options.status));
    $inspect(isIntermediateStatus(options.status));

</script>

<main class="w-full h-full border border-ide-accent/10 flex flex-col bg-ide-card rounded-lg overflow-hidden border border-ide-accent/10">
    <div class="w-full h-10 bg-ide-dcard flex items-center justify-between px-4 border-b border-ide-accent/10">
        <button class="py-2 px-4 hover:cursor-pointer" onclick={() => {
			options.stdOut = '';
		}}>
			<span class="text-sm text-ide-text-secondary/60 select-none">Clear</span>
		</button>
        <span class="text-sm text-ide-text-secondary/60 select-none">
            {options.stdOut ? 'Running...' : 'Waiting for output'}
        </span>
    </div>
    
    <div
		{@attach node => {
			node.scrollTop = node.scrollHeight
		}}
        class="w-full flex-grow overflow-x-auto overflow-y-auto bg-ide-card p-4 font-mono text-sm"
    >
        {#if options.stdOut}
            <pre class="text-ide-text-primary whitespace-pre-line break-words">{options.stdOut}</pre>
        {:else}
            <div class="flex items-center justify-center h-full text-ide-text-secondary/40">
                <div class="flex items-center gap-2">
					<TerminalIconSvg options={{class: "stroke-ide-text-secondary w-5 h-5 stroke-[1.5]"}}/>
                    <span class="text-sm">No output yet</span>
                </div>
            </div>
        {/if}
    </div>
</main>