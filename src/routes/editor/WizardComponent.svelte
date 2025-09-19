<script lang="ts">
	import { ComponentRegistry } from "./ComponentRegistry";
	import type { WizardComponentArg } from "./ResizableComponentArg";

  let { options }: { options: WizardComponentArg} = $props();
  let feturedElementIndex: number = $state(0);

</script>

<main class="w-full h-full flex {options.side === 0 ? 'flex-col' : ''} {options.side === 1 ? 'flex-row' : ''} {options.side === 2 ? 'flex-col-reverse' : ''}">
  {#if options.side === 0 || options.side === 2}
    {@render HorizontalTabDiv()}
  {:else}
    {@render VerticalTabDiv()}
  {/if}
  <div bind:this={options.componentsContainer} class="w-full flex-grow bg-amber-950 relative">
    {#each options.components as component, i}
      {@const Comp = ComponentRegistry.get(component.component)!}
      <!-- {@const options = component.options} -->
      <div class="w-full h-full absolute top-0 left-0 {i !== feturedElementIndex ? 'invisible' : ''}">
        <Comp bind:options={component.options}/>
      </div>
    {/each}
  </div>
</main>

{#snippet VerticalTabDiv()}
  <div class="h-full w-10 bg-amber-400 gap-3 flex flex-col items-center justify-start">
    {#each options.components as _, i}
      <button class="w-[90%] aspect-square border-2 {i === feturedElementIndex ? 'bg-amber-950' : ''} border-black rounded-md" onclick="{()=>{feturedElementIndex = i}}">{i}</button>
    {/each}
  </div>
{/snippet}

{#snippet HorizontalTabDiv()}
  <div class="w-full h-10 bg-amber-400  gap-3 flex items-center justify-start">
    {#each options.components as _, i}
      <button class="w-[10%] h-[90%] border-2 {i === feturedElementIndex ? 'bg-amber-950' : ''} border-black rounded-md" onclick="{()=>{feturedElementIndex = i}}">{i}</button>
    {/each}
  </div>
{/snippet}