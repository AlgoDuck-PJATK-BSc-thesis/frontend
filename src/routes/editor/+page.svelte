<script lang="ts">
	import type { Problem } from "$lib/types/Problem";
	import Editor from "./Editor.svelte";
  let { data } : { data: { hideHeader: boolean, data: Problem } } = $props();

</script>
<main class="w-full flex justify-center items-center h-full bg-red-400">
  <div class="w-[60%] h-[60%] bg-blue-700">
    <Editor {data}/>
  </div>
</main>