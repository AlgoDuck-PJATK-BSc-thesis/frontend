<script lang="ts">
	import Monaco from "$lib/Components/GenericComponents/monaco/monaco.svelte";
import ChevronIconSvg from "$lib/svg/ChevronIconSvg.svelte";
	import type { TestCase } from "./TestCase";

    let { testCase = $bindable() }: { testCase: TestCase } = $props();

    let isExpanded: boolean = $state(true);

    let editorContents: string = $state("");
</script>

<main class="w-full flex flex-col justify-start">
    <div class="w-full h-12 shrink-0">
        <button onclick={() => {
            isExpanded = !isExpanded;
        }} class="w-full h-full flex justify-between items-center">
            <span>Test Case</span>
            <div class="w-6 h-6 stroke-black stroke-[2] {isExpanded ? "rotate-90" : ""}">
                <ChevronIconSvg options={{ }}/>
            </div>
        </button>
    </div>
    <div class="{isExpanded ? "w-full flex flex-col items-center justify-center" : "h-0 overflow-hidden"}">
        <div class="w-full flex flex-col">
            <div class="p-3 w-full">
                <h3 class="text-2xl font-semibold border-b-2 border-b-black w-full px-3 py-2">Problem template</h3>
            </div>
            <div class="w-full h-52">
                <Monaco bind:editorContents/>
            </div>
        </div>
    </div>
</main>