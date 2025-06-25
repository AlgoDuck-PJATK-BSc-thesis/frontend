<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";
  import type { ExerciseData } from "./proxy+page";
   
  let { data } : {data: ExerciseData} = $props();
  let userCode = $state(data.template);
  let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
  let monaco: typeof Monaco | null = null;
  let editorContainer: HTMLElement;

  const getMonacoTheme = () => {
    let current = document.documentElement.getAttribute('data-theme') || 'light';
    switch (current) {
      case 'light':
        return "vs";
      case 'dark':
        return "vs-dark"; 
      default:
        return "vs";
    }
  }

  onMount(async () => {
    try {      
      monaco = (await import("./monaco")).default;
      
      if (!editorContainer || !monaco) return;

      editor = monaco.editor.create(editorContainer, {
        value: userCode,
        language: "java",
        theme: getMonacoTheme(),
        minimap: {
          enabled: false
        },
        readOnly: false,
        automaticLayout: true,
      });


      //this is just a test. This executes after the editor mounts so we could add a loading icon while it's getting set-up, sure it's about 200ms but still noticeable
    //   let data_div: HTMLElement | null = document.getElementById("data-div");
    //     if (data_div){
    //         data_div.style.background = "#FF0000";
    //     }

    } catch (error) {
      console.error(error);
    } 
  });

  onDestroy(() => {
    try {
      if (editor) {
        editor.dispose();
        editor = null;
      }
      
      if (monaco) {
        monaco.editor.getModels().forEach((model) => {
          model.dispose();
        });
      }
    
    } catch (error) {
      console.error(error);
    }
  });

  const handleVerticalResize = (e: MouseEvent) => {
 
}

const handleHorizontalResize = (e: MouseEvent) => {
    const mouseX = e.clientX;
    
    document.addEventListener('mousemove', handleMouseDraggedHorizontal);
    document.addEventListener('mouseup', handleRelease);
}

let originalXLeft = -1;
let originalXRight = -1;

const handleMouseDraggedHorizontal = (e: MouseEvent) => {
    const elem: HTMLElement | null = document.getElementById('data-div');
    const elem2: HTMLElement | null = document.getElementById('code-holder');
    //TODO optimize this
    if (elem === null || elem2 === null) return;
    if (originalXLeft === -1){
        originalXLeft = parseInt(getComputedStyle(elem).width.replaceAll('px', ''));
        originalXRight = parseInt(getComputedStyle(elem2).width.replaceAll('px', ''));
    }else{
        const dx = e.clientX - originalXLeft;
        elem.style.width = `${originalXLeft + dx}px`;
        elem2.style.width = `${originalXRight - dx}px`;
    }
    elem.style.width = `${e.clientX}px`;
  
}

const handleRelease = (e: MouseEvent) => {
  document.removeEventListener('mousemove', handleMouseDraggedHorizontal);
  document.removeEventListener('mouseup', handleRelease);
}

</script>

<main class="flex h-[80vh] w-full my-5 bg-[var(--color-bg)]">
  <div id="data-div" class="flex flex-col text-center w-[30%] h-full overflow-hidden">
    <div class="flex justify-center text-l items-center w-full h-[20%]">
        <span class="m-2">
          {data.name}
        </span>
    </div>
    <div class="w-full h-[80%] bg-[var(--color-tile)] rounded-md text-xs overflow-scroll">
        <p class="mx-2 my-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut voluptatem delectus quod nesciunt modi vel adipisci eveniet, iste, molestias odio architecto explicabo incidunt facere quibusdam, beatae fuga corrupti sint possimus!
        </p>
        <hr>
        <p class="mx-2 my-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut voluptatem delectus quod nesciunt modi vel adipisci eveniet, iste, molestias odio architecto explicabo incidunt facere quibusdam, beatae fuga corrupti sint possimus!
        </p>
        <hr>
        <p class="mx-2 my-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut voluptatem delectus quod nesciunt modi vel adipisci eveniet, iste, molestias odio architecto explicabo incidunt facere quibusdam, beatae fuga corrupti sint possimus!
        </p>
        
    </div>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="w-[5px] h-full bg-red-600 hover:cursor-col-resize " onmousedown={handleHorizontalResize} onmouseup={handleRelease}>

  </div>
  <div id="code-holder" class="w-full h-full flex flex-col px-1">
      <div id="monaco-container" class="w-full h-[85%] rounded-t-md overflow-hidden" bind:this={editorContainer}></div>
      <div class="w-full h-[15%] bg-[var(--color-tile)] px-3 py-1 rounded-b-md ">
        <span class="font-mono">/&#123;hiya&#125;/terminal&gt; </span>
      </div>
  </div>
</main>