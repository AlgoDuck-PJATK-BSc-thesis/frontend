<script lang="ts">
	import type { ExerciseData } from "../../Types/ExerciseData";
  let { data, dataDiv = $bindable() } : { data: ExerciseData, dataDiv?: HTMLElement } = $props();

  let htmlDescriptionDiv: HTMLElement;
  let htmlTestCaseDiv: HTMLElement;
  let htmlControlDiv: HTMLElement;

  let htmlDescriptionDivChevron: SVGSVGElement;
  let htmlTestCaseDivChevron: SVGSVGElement;
  let htmlControlDivChevron: SVGSVGElement;

  const defaultTileHeight: number = 40; 

  let testCaseIndex: number = $state(0);

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


  const executeCode = (code: string) => {

  }

  const submitCode = (code: string) => {

  }

</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={dataDiv} class="flex flex-col text-center w-[30%] h-full overflow-hidden">
  <div class="flex justify-center text-l items-center w-full h-[20%]">
    <span class="m-2">
      {data.name}
    </span>
  </div>
  <div class="w-full h-[80%] py-2 px-1 bg-[var(--color-tile)] text-xs overflow-scroll">
    <!-- description -->
      <div bind:this={htmlDescriptionDiv} class="w-full h-10 bg-red-500 rounded-t-md overflow-hidden">
        <div class="w-full h-10 bg-[var(--color-bg)] px-5 flex items-center justify-between hover:cursor-pointer" onclick={() => toggleTile(htmlDescriptionDiv, htmlDescriptionDivChevron, defaultTileHeight, 400)}> 
            <span style="user-select: none;">Description</span>
            <svg bind:this={htmlDescriptionDivChevron} class="fill-white h-6 w-6" viewBox="0 0 407.437 407.437"><polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "/></svg> <!-- TODO placeholder so chill out Maja -->
        </div>
        <div class="w-full h-90 bg-[var(--color-bg)] flex flex-col justify-between">
          <div class="bg-[var(--color-bg)] h-[90%] flex justify-start p-3">
            <p>{data.description}</p>
          </div>
          <div class="flex justify-end items-center bg-[var(--color-bg)] h-[10%] p-3 mx-5 border-t-2 border-[var(--color-accent-1)]">
            {#each data.tags as tag}
              <p class="mx-1">{`#${tag}`}</p>
            {/each}
          </div>  
          
        </div>
      </div>
      <div bind:this={htmlTestCaseDiv} class="w-full h-10 overflow-hidden">
        <div class="w-full h-10 bg-[var(--color-bg)] px-5 flex items-center justify-between hover:cursor-pointer" onclick={() => toggleTile(htmlTestCaseDiv, htmlTestCaseDivChevron, defaultTileHeight, 240)}> 
            <span style="user-select: none;">Test Cases</span> <!-- Figure out why this works in inline style but not tailwind -->
            <svg bind:this={htmlTestCaseDivChevron} class="fill-white h-6 w-6" viewBox="0 0 407.437 407.437"><polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "/></svg>
        </div>
        <div class="w-full h-50 overflow-hidden bg-[var(--color-bg)]"> 
          <div class="flex flex-col justify-start py-2 px-5">
            {#each [data.testCases[testCaseIndex]] as testCase (testCaseIndex)}
              <div>
                <div class="flex justify-start p-1">
                  <span>Test Data</span>
                </div>
                <div class="rounded-sm h-10 bg-[var(--color-tile)] flex flex-col justify-center p-2 border-2 border-[var(--color-accent-1)]" >
                  <span class="flex justify-start">{testCase.testData}</span>
                </div>

                <div class="flex justify-start pt-3 p-1">
                  <span>Expected Output</span>
                </div>
                <div class="rounded-sm h-10 bg-[var(--color-tile)] flex flex-col justify-center p-2 border-2 border-[var(--color-accent-1)]" >
                  <span class="flex justify-start">{testCase.expectedOutput}</span>
                </div>
              </div>
            {/each}
            <div class="flex justify-between p-5">
              {#if testCaseIndex > 0}
                <p class="hover:cursor-pointer w-[10%]" onclick={()=>{testCaseIndex--}}>&lt;</p>
              {:else}
                <p class="w-[10%]"></p>
              {/if}
              <p>{`${testCaseIndex + 1}/${data.testCases.length}`}</p>
              {#if testCaseIndex < 2}
                <p class="hover:cursor-pointer w-[10%]" onclick={()=>{testCaseIndex++}}>&gt;</p>
              {:else}
                <p class="w-[10%]"></p>
              {/if}
            </div>
          </div>
        </div>
      </div>
      <div bind:this={htmlControlDiv} class="w-full h-10 rounded-b-md overflow-hidden">
        <div class="w-full h-10 bg-[var(--color-bg)] px-5 flex items-center justify-between hover:cursor-pointer" onclick={() => toggleTile(htmlControlDiv, htmlControlDivChevron, defaultTileHeight, 100)}> 
            <span class="select-none">Control</span>
            <svg bind:this={htmlControlDivChevron} class="fill-white h-6 w-6" viewBox="0 0 407.437 407.437"><polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 "/></svg>
        </div>
        <div class="w-full h-15 p-2 bg-[var(--color-bg)] flex justify-center">
          <div class="w-[50%] hover:cursor-pointer rounded-l-md h-full flex justify-center items-center bg-[var(--color-tile)] border-2 border-r-1 border-[var(--color-primary)]">
            <span style="user-select: none;">Execute</span> 
          </div>
          <div class="w-[50%] hover:cursor-pointer rounded-r-md h-full flex justify-center items-center bg-[var(--color-tile)] border-2 border-l-1 border-[var(--color-primary)]">
            <span style="user-select: none;">Submit</span>
          </div>
       </div>
      </div>
  </div>
</div> 

{#snippet TestCaseCard(testCaseContents: string, expectedOutput: string)}
<div class="flex flex-col justify-start p-2">
  <div class="flex justify-start">
    <span>Test Data</span>
  </div>
  <div class="rounded-sm h-6 bg-[rgba(60,60,60,255)] flex flex-col justify-center items-center">
    <span>{`test case contents: ${testCaseContents}`}</span>
  </div>
  <div class="flex justify-start">
    <span>Expected Output</span>
  </div>
  <div class="rounded-sm h-6 bg-[rgba(60,60,60,255)] flex flex-col justify-center items-center">
    <span>{`expected output: ${expectedOutput}`}</span>
  </div>
</div>
{/snippet}