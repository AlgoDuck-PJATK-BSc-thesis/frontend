<script lang="ts">
	import RightGutter from './RightGutter.svelte';
	import TopPanel from './TopPanel.svelte';
	import SettingsPanel from './SettingsPanel.svelte';
	import type { Problem } from '$lib/types/Problem';
	import type { ComponentConfig, ComponentType } from '../../../../../editor/ResizableComponentArg';
	import type { Component } from 'svelte';
	import { ComponentRegistry } from '../../../../../editor/ComponentRegistry';

	let { problemDto }: { problemDto: Problem } = $props();

	let isTerminalShown: boolean = $state(true);
	let isTestCasesShown: boolean = $state(false);
	let isExecutingCode: boolean = $state(false);
	let isSettingsPanelShown = $state(false);

	let rootCompType: ComponentType = $state('TopLevelComponent');
  let RootComp: Component<any> = $derived(ComponentRegistry.get(rootCompType)!);

	const exploreNode = (target: ComponentConfig<any>) : ComponentConfig<any>[] => {
		if (target.options.component.component === 'SplitPanel'){
			return [ target.options.component.options.comp1, target.options.component.options.comp2 ];
		}else if (target.options.component.component === 'WizardPanel'){
			return target.options.component.options.components;
		}else{
			return [];
		}
	}
			
	const consumeNode = (target: ComponentConfig<any>): void => {
		const nodeStripped: ComponentConfig<any> = target.options.component;
		if (nodeStripped.component === 'Editor'){
			target.options.component.options = {
  		  editorContents: problemDto.templateContents, 
  		  fontSize: 16
  		}
		}else if (nodeStripped.component === 'Terminal'){
			target.options.component.options = {
  		  terminalContents: ''
  		}
		}else if (nodeStripped.component === 'InfoPanel'){
			target.options.component.options = { 
				problem: problemDto 
			}
		}else if (nodeStripped.component === 'TestCases'){
			target.options.component.options = {
				testCases: problemDto.testCases,
			}
    }
  }

	const hydrateLayout = () : void=>{
		let toBeExplored: ComponentConfig<any>[] = [ loadedConfig2 ];
		while (toBeExplored.length > 0){
			let frontier: ComponentConfig<any>[] = []
			toBeExplored.forEach(cc => {
				consumeNode(cc);
				frontier.push(...exploreNode(cc));
			})
		toBeExplored = frontier;
		}
	};

	
	
  let loadedConfig2: ComponentConfig<any> = JSON.parse('{  \"component\": \"TopLevelComponent\",  \"options\": {    \"component\": {      \"component\": \"SplitPanel\",      \"options\": {        \"axis\": 0,        \"comp1\": {          \"component\": \"TopLevelComponent\",          \"options\": {            \"component\": {              \"component\": \"Editor\",              \"options\": {                \"editorContents\": \"\",                \"fontSize\": 32              }            }          }        },        \"comp2\": {          \"component\": \"TopLevelComponent\",          \"options\": {            \"component\": {              \"component\": \"WizardPanel\",              \"options\": {                \"components\": [                  {                    \"component\": \"TopLevelComponent\",                    \"options\": {                      \"component\": {                        \"component\": \"Terminal\",                        \"options\": {                          \"terminalContents\": \"\"                        }                      }                    }                  },                  {                    \"component\": \"TopLevelComponent\",                    \"options\": {                      \"component\": {                        \"component\": \"TestCases\",                        \"options\": {                          \"testCases\": []                        }                      }                    }                  },                  {                    \"component\": \"TopLevelComponent\",                    \"options\": {                      \"component\": {                        \"component\": \"InfoPanel\",                        \"options\": {                          \"problem\": {                            \"problemId\": \"\",                            \"title\": \"\",                            \"description\": \"\",                            \"category\": {                              \"name\": \"\"                            },                            \"difficulty\": {                              \"name\": \"\"                            },                            \"type\": {                              \"name\": \"\"                            },                            \"templateContents\": \"\",                            \"testCases\": [],                            \"tags\": []                          }                        }                      }                    }                  }                ],                \"side\": 3              }            }          }        },        \"initialComp1Proportions\": 0.5      }    }  }}') as ComponentConfig<any>;
	hydrateLayout();
	let config: ComponentConfig<any> = $state(loadedConfig2);

	// placeholders for now
	const executeCode = (): void => {
		isExecutingCode = true;
	}

	const submitCode = (): void => {
		isExecutingCode = true;
	}
	
</script>

<main class="w-full h-[100vh] flex flex-col">
	{#if isSettingsPanelShown}
		<SettingsPanel bind:isSettingsPanelShown />
	{/if}

	<div class="w-full h-[5%]">
		<TopPanel
			executeCallback={executeCode}
			submitCallback={submitCode}
			isExecuting={isExecutingCode}
			bind:isSettingsPanelShown
		/>
	</div>

	<div class="w-full h-[95%] flex">
		<RootComp bind:options={config.options}/>
	</div>
</main>
