<script lang="ts">
	import { onMount } from "svelte";
	import type { ExerciseData, ExecResponse } from "../../Types/index";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
	import type { Problem } from "../../Types/Categories/Problem";

  let { data, editor, terminalContents = $bindable(), dataDiv = $bindable()} : { data: Problem, editor: Monaco.editor.IStandaloneCodeEditor | null, terminalContents: HTMLElement, dataDiv?: HTMLElement} = $props();

  let htmlDescriptionDiv: HTMLElement;
  let htmlTestCaseDiv: HTMLElement;
  let htmlControlDiv: HTMLElement;

  let htmlDescriptionDivChevron: SVGSVGElement;
  let htmlTestCaseDivChevron: SVGSVGElement;
  let htmlControlDivChevron: SVGSVGElement;

  const defaultTileHeight: number = 40; 

  let testCaseIndex: number = $state(0);
  let testCaseResults: Array<boolean> = $state([]);

  let title: string = $derived(data?.title || '')
  let description: string = $derived(data?.description || '')
  let testCases = $derived(data?.testCases || []);

  const toggleTile = (elementToToggle: HTMLElement, chevron: SVGSVGElement,  defaultHeight: number, expandedHeight: number) => {
    chevron.style.transition = 'all 0.3s ease';
    if (!(chevron.style.rotate === "180deg")){
      expandTile(elementToToggle, expandedHeight);
      chevron.style.rotate = "180deg"
    }else{
      shrinkTile(elementToToggle, defaultHeight);
      chevron.style.rotate = "0deg"
    }
  };

  const expandTile = (elementToToggle: HTMLElement, expandedHeight: number) => {
    elementToToggle.style.height = `${expandedHeight}px`;
    elementToToggle.style.transition = 'all 0.3s ease';
  }
  
  const shrinkTile = (elementToToggle: HTMLElement, defaultHeight: number) => {
    elementToToggle.style.height = `${defaultHeight}px`;
  }


  const getCurrentContent = (): string => {
    if (!editor) return '';
    return editor.getValue();
  }

  const executeCode = async () : Promise<void> => {
    const userContent: string = getCurrentContent();
    const result = await fetch("http://localhost:8080/api/Executor/dry",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        CodeB64: `${btoa(userContent)}`,
        Lang: "java",
        ExerciseId: data.problemId,
      })
    });

    const serverResponse: ExecResponse = await result.json();

    console.log(serverResponse);

    const earlierOutput: string = terminalContents.innerText;
    terminalContents.innerText = `${earlierOutput}${serverResponse.stdOutput}~/>`;
  }

  const submitCode = async () : Promise<void> => {
    const userContent: string = getCurrentContent();
    const result = await fetch("http://localhost:8080/api/Executor/full",
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        CodeB64: `${btoa(userContent)}`,
        Lang: "java",
        ExerciseId: data.problemId,
      })
    });

    const serverResponse: ExecResponse = await result.json();
    console.log(serverResponse);
    
    terminalContents.innerText = `${serverResponse.stdOutput}${terminalContents.innerText}`;
  }

  const prevTestCase = () : void => {
    testCaseIndex--;
  }

  const nextTestCase = () : void => {
    testCaseIndex++;
  }

  onMount(()=>{
    toggleTile(htmlDescriptionDiv, htmlDescriptionDivChevron, defaultTileHeight, 400);
    toggleTile(htmlControlDiv, htmlControlDivChevron, defaultTileHeight, 100)
  });

  const getBorderColor = (index: number, type: 'input' | 'output'): string => {
  if (testCaseResults.length === 0 || index >= testCaseResults.length) {
    return 'border-[var(--color-accent-1)]';
  }
  
  const passed = testCaseResults[index];
  if (passed) {
    return 'border-green-500';
  } else {
    return 'border-red-500'; 
  }
};

</script>


<div bind:this={dataDiv} class="flex flex-col text-center w-[30%] h-full overflow-hidden">
  <div class="flex justify-center text-l items-center w-full h-[20%]">
    <span class="m-2">
      {title}
    </span>
  </div>
  <div class="w-full h-[80%] py-2 px-1 bg-[var(--color-tile)] text-xs overflow-scroll">
    <!-- description -->
      <div bind:this={htmlDescriptionDiv} class="w-full h-10 rounded-t-md overflow-hidden">
        <button class="w-full h-10 bg-[var(--color-bg)] px-5 flex items-center justify-between hover:cursor-pointer" onclick={() => toggleTile(htmlDescriptionDiv, htmlDescriptionDivChevron, defaultTileHeight, 400)}> 
            <span style="user-select: none;">Description</span>
            <svg bind:this={htmlDescriptionDivChevron} class="fill-white h-6 w-6" viewBox="0 0 407.437 407.437"><polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "/></svg> <!-- TODO placeholder so chill out Maja -->
        </button>
        <div class="w-full h-90 bg-[var(--color-bg)] flex flex-col justify-between">
          <div class="bg-[var(--color-bg)] h-[90%] flex justify-start p-3">
            <p>{description}</p>
          </div>
          <div class="flex justify-end items-center bg-[var(--color-bg)] h-[10%] p-3 mx-5 border-t-2 border-[var(--color-accent-1)]">
            {#each ["tag 1", "tag 2", "tag 3"] as tag}
              <p class="mx-1">{`#${tag}`}</p>
            {/each}
          </div>  
          
        </div>
      </div>
      <div bind:this={htmlTestCaseDiv} class="w-full h-10 overflow-hidden">
        <button class="w-full h-10 bg-[var(--color-bg)] px-5 flex items-center justify-between hover:cursor-pointer" onclick={() => toggleTile(htmlTestCaseDiv, htmlTestCaseDivChevron, defaultTileHeight, 240)}> 
            <span style="user-select: none;">Test Cases</span> <!-- Figure out why this works in inline style but not tailwind -->
            <svg bind:this={htmlTestCaseDivChevron} class="fill-white h-6 w-6" viewBox="0 0 407.437 407.437"><polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "/></svg>
        </button>
        <div class="w-full h-50 overflow-hidden bg-[var(--color-bg)]"> 
          <div class="flex flex-col justify-start py-2 px-5">
            {#each testCases as testCase, i (i)}
              <div>
                <div class="flex justify-start p-1">
                  <span>Test Data</span>
                </div>
                <div class="rounded-sm h-10 bg-[var(--color-tile)] flex flex-col justify-center p-2 border-2 {getBorderColor(i, 'input')}">
                  <span class="flex justify-start">{testCase.display}</span>
                </div>

                <div class="flex justify-start pt-3 p-1">
                  <span>Expected Output</span>
                </div>
                  <div class="rounded-sm h-10 bg-[var(--color-tile)] flex flex-col justify-center p-2 border-2 {getBorderColor(i, 'output')}" >
                    <span class="flex justify-start">{testCase.displayRes}</span>
                </div>
              </div>
            {/each}
            <div class="flex justify-between p-5">
              {#if testCaseIndex > 0}
                <button class="hover:cursor-pointer w-[10%]" onclick={prevTestCase}>&lt;</button>
              {:else}
                <p class="w-[10%]"></p>
              {/if}
              <p>{`${testCaseIndex + 1}/${testCases.length}`}</p>
              {#if testCaseIndex < 2}
                <button class="hover:cursor-pointer w-[10%]" onclick={nextTestCase}>&gt;</button>
              {:else}
                <p class="w-[10%]"></p>
              {/if}
            </div>
          </div>
        </div>
      </div>
      <div bind:this={htmlControlDiv} class="w-full h-10 rounded-b-md overflow-hidden">
        <button class="w-full h-10 bg-[var(--color-bg)] px-5 flex items-center justify-between hover:cursor-pointer" onclick={() => toggleTile(htmlControlDiv, htmlControlDivChevron, defaultTileHeight, 100)}> 
            <span class="select-none">Control</span>
            <svg bind:this={htmlControlDivChevron} class="fill-white h-6 w-6" viewBox="0 0 407.437 407.437"><polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "/></svg>
        </button>
        <div class="w-full h-15 p-2 bg-[var(--color-bg)] flex justify-center">
          <button class="w-[50%] hover:cursor-pointer rounded-l-md h-full flex justify-center items-center bg-[var(--color-tile)] border-2 border-r-1 border-[var(--color-primary)]"
            onclick={executeCode}
          >
            <span style="user-select: none;">Execute</span> 
          </button>
          <button class="w-[50%] hover:cursor-pointer rounded-r-md h-full flex justify-center items-center bg-[var(--color-tile)] border-2 border-l-1 border-[var(--color-primary)]"
            onclick={submitCode}
          >
            <span style="user-select: none;">Submit</span>
          </button>
       </div>
      </div>
  </div>
</div> 