<script lang="ts">
	import type { TerminalComponentArgs } from '$lib/Components/ComponentTrees/IdeComponentTree/component-args';
	import TerminalIconSvg from '$lib/svg/EditorComponentIcons/TerminalIconSvg.svelte';

	let { options = $bindable() }: { options: TerminalComponentArgs } = $props();
</script>

<main
	class="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-ide-bg font-mono"
>
	<div class="absolute top-6 left-6 flex flex-col gap-2 text-xs text-ide-text-secondary opacity-15">
		<div class="flex items-center gap-2">
			<span class="text-ide-accent">&gt;</span>
			<div class="h-2 w-32 rounded bg-ide-text-secondary/30"></div>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-ide-accent">&gt;</span>
			<div class="h-2 w-20 rounded bg-ide-text-secondary/20"></div>
		</div>
		<div class="flex items-center gap-2">
			<span class="text-ide-accent">&gt;</span>
			<div class="h-3 w-2 animate-pulse bg-ide-text-secondary/40"></div>
		</div>
	</div>

	<div class="relative z-10 flex flex-col items-center gap-3">
		<div class="rounded-xl border border-ide-dcard bg-ide-card p-4">
			<TerminalIconSvg options={{ class: 'w-12 h-12 stroke-[1.5] stroke-green-400/80' }} />
		</div>
		<span class="text-sm font-light tracking-wide text-ide-text-secondary/60"
			>Execution output appears here</span
		>
	</div>
</main>
