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
      let data_div: HTMLElement | null = document.getElementById("data-div");
        if (data_div){
            data_div.style.background = "#FF0000";
        }

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
</script>

<main class="flex h-[80vh] w-full my-5">
  <div id="data-div" class="flex flex-col bg-[var(--color-tile)] text-center w-[30%] h-full">
    <p class="m-2">
      {data.name}
    </p>
    <p class="m-2">
      {data.description}
    </p>
  </div>
  <div id="monaco-container" class=" w-full h-full" bind:this={editorContainer}></div>
</main>