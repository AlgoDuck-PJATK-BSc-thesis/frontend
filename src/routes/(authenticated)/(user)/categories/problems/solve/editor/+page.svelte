<script lang="ts">
	import type { ComponentConfig, ControlPanelArgs, tabSide, WizardComponentArg } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
	import Editor from "./Editor.svelte";

  let registeredComponents: ComponentConfig<any>[] = $state([
    {
      compId: "terminal-comp",
      component: "Terminal",
      options: {},
      meta: {
        label: {
          commonName: "Terminal",
          labelFor: "terminal-comp",
          icon: {
            compId: "someComp",
            component: "EditorIconSvg",
            options: {}
          }
        }
      }
    },
    {
      compId: "problem-info",
      component: "InfoPanel",
      options: {},
      meta: {
        label: {
          commonName: "Problem Info",
          labelFor: "problem-info",
          icon: {
            compId: "someComp",
            component: "InfoPanelIconSvg",
            options: {}
          }
        }
      }
    },
    {
      compId: "test-cases-comp",
      component: "TestCases",
      options: {},
      meta: {
        label: {
          commonName: "Test Cases",
          labelFor: "test-cases-comp",
          icon: {
            compId: "someComp",
            component: "TestCasesIconSvg",
            options: {}
          }
        }
      }
    },
    {
      compId: "code-editor",
      component: "Editor",
      options: {},
      meta: {
        label: {
          commonName: "Code Editor",
          labelFor: "code-editor",
          icon: {
            compId: "someComp",
            component: "TerminalIconSvg",
            options: {}
          }
        }
      }
    },
    {
			compId: 'assistant-wizard',
			component: 'TerminalWizardPanel',
			options: {
				components: [],
				side: 3 as tabSide,
				control: {
					compId: 'wizard-control-panel',
					component: 'AssistantWizardControlPanel',
					options: {} as ControlPanelArgs
				}
			} as WizardComponentArg,
			meta: {
				label: {
					commonName: 'Assistant',
					labelFor: 'assistant-wizard',
					icon: {
						compId: 'assistant-icon',
						component: 'AssistantIconSvg',
						options: {}
					}
				}
			}
		}
  ])

</script>
<main class="w-full flex justify-center items-center h-full">
  <div class="w-380 h-200 max-w-full max-h-full">
    <Editor {registeredComponents}/>
  </div>
</main>

<svelte:head>
	<title>Editor - Algoduck</title>
</svelte:head>