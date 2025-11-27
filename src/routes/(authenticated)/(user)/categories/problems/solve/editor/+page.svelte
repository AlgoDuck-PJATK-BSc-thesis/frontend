<script lang="ts">
	import type { Problem } from "$lib/types/Problem";

  let registeredComponents: Record<string, object> = $state({
    "Terminal":  {},
    "InfoPanel": {},
    "TestCases": {},
    "Editor":{}
  });

</script>
<main class="w-full flex justify-center items-center h-full bg-red-400">
<!--   <div class="w-[60%] h-[80%] bg-blue-700">
    <Editor {registeredComponents}/>
  </div> -->
</main>