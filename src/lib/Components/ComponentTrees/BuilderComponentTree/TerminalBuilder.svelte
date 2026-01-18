<script lang="ts">
	import type { TerminalComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import TerminalIconSvg from "$lib/svg/EditorComponentIcons/TerminalIconSvg.svelte";

  let { options = $bindable() }: { options: TerminalComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-zinc-500">
  <TerminalIconSvg options={{ class: "w-18 h-18 stroke-[3] stroke-ide-text-primary" }}/>
  <span class="text-md text-ide-text-secondary">Your code execution output will appear here</span>
</main>

