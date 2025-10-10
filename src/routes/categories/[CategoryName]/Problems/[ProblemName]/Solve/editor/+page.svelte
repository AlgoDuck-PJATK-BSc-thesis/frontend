<script lang="ts">
	import type { Problem } from "$lib/types/Problem";
	import Editor from "./Editor.svelte";
  
  const sampleProblem: Problem = {
    "problemId": "",
    "title": "",
    "description": "",
    "category": {
        "name": ""
    },
    "difficulty": {
        "name": "EASY"
    },
    "type": {
        "name": ""
    },
    "templateContents": "",
    "testCases": [],
    "tags": [],
  }

  let registeredComponents: Record<string, object> = $state({
    "Terminal":  {
      terminalContents: ''
    },
    "InfoPanel": {
      problem: sampleProblem
    },
    "TestCases": {
      testCases: sampleProblem.testCases
    },
    "Editor":{
      editorContents: sampleProblem.templateContents, 
      fontSize: 16
    }
  });

</script>
<main class="w-full flex justify-center items-center h-full bg-red-400">
  <div class="w-[60%] h-[80%] bg-blue-700">
    <Editor {registeredComponents}/>
  </div>
</main>