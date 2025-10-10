<script lang="ts">
	import type { EditorCompArgs } from "$lib/types/EditorTabCompArgs";
	import type { Problem } from "$lib/types/Problem";
	import { activeProfile } from "../editor/ComponentRegistry.svelte";
	import Editor from "../editor/Editor.svelte";

  let { options }: { options: EditorCompArgs } = $props();

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

  activeProfile.profile = 'placeholder';

</script>

<main class="w-full h-full px-5">
  <Editor {registeredComponents}/>
</main>