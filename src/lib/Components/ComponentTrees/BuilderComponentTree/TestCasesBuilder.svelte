<script lang="ts">
	import type { TestCaseComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import TestCasesIconSvg from "../IdeComponentTree/SplitPanel/Comp2/SplitPanel/Comp2/WizardPanel/Comp2/TestCasesIconSvg.svelte";

  let { options = $bindable() }: { options: TestCaseComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-zinc-500">
  <TestCasesIconSvg options={{ class: "w-18 h-18 stroke-[3] stroke-ide-text-primary" }}/>
  <span class="text-md text-ide-text-secondary">Your test cases will appear here</span>
</main>

