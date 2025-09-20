<script lang="ts">
	import { ComponentRegistry } from "./ComponentRegistry";
	import PlaceholderPanelIconSvg from "$lib/svg/EditorComponentIcons/PlaceholderPanelIconSvg.svelte";

	import type { svgArg } from "$lib/types/SvgIcon";
	import type { Component } from "svelte";
	import type { WizardComponentArg } from "./ResizableComponentArg";

  let { options }: { options: WizardComponentArg} = $props();
  let feturedElementIndex: number = $state(0);

  // TODO: this could use some caching, absolutely no need to reload the entire thing for every icon added, makes it flicker
  let svgComponents: Promise<Component<{options: svgArg}, {}, "">[]> = $derived.by(async (): Promise<Component<{options: svgArg}, {}, "">[]> => {
    return await Promise.all(
      options.components.map(async (comp) => {
        return (await import(`$lib/svg/EditorComponentIcons/${comp.options.component.component}IconSvg.svelte`)).default;
      })
    );
  });

</script>

<main class="w-full h-full rounded-xl overflow-hidden flex {options.side === 0 ? 'flex-col' : ''} {options.side === 1 ? 'flex-row-reverse' : ''} {options.side === 2 ? 'flex-col-reverse' : ''}">
  {#if options.side === 0 || options.side === 2}
      {@render HorizontalTabDiv()}
    {:else}
      {@render VerticalTabDiv()}
    {/if}
  <div bind:this={options.componentsContainer} class="w-full flex-grow bg-gray-300 relative">
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
  <div class="h-full w-10 flex-shrink-0 bg-ide-bg gap-1 flex flex-col py-1.5 items-center justify-start">
    {#each options.components as _, i}
      <button class="w-[80%] aspect-square p-[5%] flex justify-center items-center hover:cursor-pointer {i === feturedElementIndex ? 'bg-gray-800' : ''} border-black rounded-md" onclick="{()=>{feturedElementIndex = i}}">
        {#await svgComponents}
           <PlaceholderPanelIconSvg options={{color: '#ffffff'}} /> 
        {:then svgSet} 
          {@const Svg1 = svgSet[i]}
          <Svg1 options={{color: '#ffffff'}} />
        {/await}
      </button>
    {/each}
  </div>
{/snippet}

{#snippet HorizontalTabDiv()}
  <div class="w-full h-10 flex-shrink-0 bg-ide-bg gap-1 px-3 flex items-center justify-start overflow-hidden">
    {#each options.components as component, i}
      <button class="h-[80%] hover:cursor-pointer px-5 gap-3 flex flex-row justify-center items-center {i === feturedElementIndex ? 'bg-gray-800' : ''} border-black rounded-md" onclick="{()=>{feturedElementIndex = i}}">
        <div class="aspect-square flex justify-center items-center p-[5%]">
          {#await svgComponents}
            <PlaceholderPanelIconSvg options={{color: '#ffffff'}} /> 
          {:then svgSet} 
            {@const Svg1 = svgSet[i]}
            <Svg1 options={{color: '#ffffff'}} />
          {/await}
        </div>
        <span class="h-full flex-grow flex justify-center items-center">{component.options.component.component}</span>
      </button>
    {/each}
  </div>
{/snippet}