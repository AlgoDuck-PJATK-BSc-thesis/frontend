<script lang="ts">
	import type { TerminalComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";


	let { options = $bindable() }: { options: TerminalComponentArgs } = $props();

	let frameCounter = 0;

	const animateTerminalContents = (): void => {
		requestAnimationFrame(animateTerminalContents);
	};
</script>

<main class="w-full h-full flex flex-col text-ide-text-primary font-bold text-xl justify-start">
	<div class="w-full h-10 bg-ide-dcard flex justify-end items-center px-5 text-lg select-none">
		<span class="flex justify-center items-center text-ide-text-secondary">Output will appear here</span
		>
	</div>
	<div class="w-full overflow-x-hidden overflow-y-scroll bg-ide-card flex-grow whitespace-pre">
		<p>{options.terminalContents}</p>
	</div>
</main>
