<script lang="ts">
	import type { CodeEditorComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import CodeEditorIconSvg from "../IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp1/CodeEditorIconSvg.svelte";

  let { options = $bindable() }: { options: CodeEditorComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-zinc-500">
  <CodeEditorIconSvg options={{ class: "w-18 h-18 stroke-[3] stroke-ide-text-primary" }}/>
  <span class="text-md text-ide-text-secondary">Your code editor will appear here</span>
</main>