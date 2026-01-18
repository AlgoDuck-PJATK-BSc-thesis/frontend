<script lang="ts">
	import type { InfoPanelComponentArgs } from "$lib/Components/ComponentTrees/IdeComponentTree/component-args";
	import InfoPanelIconSvg from "../IdeComponentTree/SplitPanel/Comp1/InfoPanelIconSvg.svelte";


  let { options = $bindable() }: { options: InfoPanelComponentArgs } = $props();
</script>

<main class="w-full h-full flex flex-col items-center justify-center bg-zinc-500">
  <InfoPanelIconSvg options={{ class: "w-18 h-18 stroke-[3] stroke-ide-text-primary" }}/>
  <span class="text-md text-ide-text-secondary">Your basic problem info will appear here</span>
</main>
