<script lang="ts">
	import { goto } from "$app/navigation";
	import { userEditorPreferences, type editorLayout } from "$lib/stores/theme.svelte";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";

	let defaultSidebar: HTMLDivElement;
	let defaultEditor: HTMLDivElement;

	let splitLeftEditor: HTMLDivElement;
	let splitRightEditorTop: HTMLDivElement;
	let splitRightEditorBottom: HTMLDivElement;

	let tabbedSlider: HTMLDivElement;
	let tabbedTimeout: NodeJS.Timeout | undefined;

	const setLayout = (layout: editorLayout) => {
		userEditorPreferences.layout = layout;
	}

	const animateDefaultIn = () => {
		defaultSidebar.style.width = '50%';
		defaultEditor.style.height = '60%';
	}

	const animateDefaultOut = () => {
		defaultSidebar.style.width = '';
		defaultEditor.style.height = '';
	}

	const animateSplitIn = () => {
		splitLeftEditor.style.width = '33%';
		splitRightEditorTop.style.height = '60%';
		splitRightEditorBottom.style.height = '60%';
	}

	const animateSplitOut = () => {
		splitLeftEditor.style.width = '';
		splitRightEditorTop.style.height = '';
		splitRightEditorBottom.style.height = '';
	}

	const animateTabbedIn = () => {
		tabbedSlider.style.transform = 'translateX(-25%)';
		tabbedTimeout = setTimeout(() => {
			tabbedSlider.style.transform = 'translateX(-50%)';
			tabbedTimeout = setTimeout(() => {
				tabbedSlider.style.transform = 'translateX(-75%)';
			}, 300);
		}, 300);
	}

	const animateTabbedOut = () => {
		if (tabbedTimeout) {
			clearTimeout(tabbedTimeout);
		}
		tabbedSlider.style.transform = '';
	}
</script>

<main class="w-full h-full bg-ide-bg z-100 border border-ide-accent rounded-lg flex flex-col">
	<span class="py-3 px-5 text-lg justify-start w-full text-ide-text-primary font-semibold border-b border-b-ide-accent/30">
		Layouts
	</span>
	
	<div class="w-full grow grid grid-cols-2 p-2 gap-x-2 gap-y-1">
		<button
			onclick={() => setLayout('default')}
			onmouseover={animateDefaultIn}
			onfocus={animateDefaultIn}
			onmouseout={animateDefaultOut}
			onblur={animateDefaultOut}
			class="w-full h-full flex flex-col items-center hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent rounded"
		>
			<div class="w-full h-full bg-ide-card flex flex-row p-0.5 gap-0.5">
				<div
					bind:this={defaultSidebar}
					class="w-1/4 transition-all ease-out duration-200 delay-100 h-full rounded-xs bg-ide-card border border-ide-accent/50"
				></div>
				<div class="grow flex flex-col gap-0.5 h-full rounded-xs">
					<div
						bind:this={defaultEditor}
						class="w-full h-3/4 transition-all ease-out duration-200 delay-300 rounded-xs bg-ide-card border border-ide-accent/50"
					></div>
					<div class="w-full grow flex flex-row justify-end rounded-xs bg-ide-card border border-ide-accent/50">
						<div class="w-1.5 border-l border-l-ide-accent"></div>
					</div>
				</div>
			</div>
			<span class="px-3 flex justify-center text-xs font-mono text-ide-text-primary">Default</span>
		</button>

		<div class="w-full h-full flex flex-col">
			<button
				onclick={() => setLayout('tabbed')}
				onmouseover={animateTabbedIn}
				onfocus={animateTabbedIn}
				onmouseout={animateTabbedOut}
				onblur={animateTabbedOut}
				class="w-full h-full bg-ide-bg flex flex-row items-center hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent rounded"
			>
				<div class="h-full w-[95%] overflow-x-hidden">
					<div bind:this={tabbedSlider} class="w-[400%] h-full grid grid-cols-4 transform-all duration-200 ease-out">
						{#each Array(4) as _, i}
							<div class="w-full h-full px-0.5">
								<div class="w-full h-full rounded-xs bg-ide-card border border-ide-accent/50"></div>
							</div>
						{/each}
					</div>
				</div>
				<div class="h-full grow bg-ide-card border border-ide-accent/50 rounded-xs"></div>
			</button>
			<span class="px-3 flex justify-center text-xs font-mono text-ide-text-primary">Tab enjoyer</span>
		</div>

		<button
			onclick={() => setLayout('split')}
			onmouseover={animateSplitIn}
			onfocus={animateSplitIn}
			onmouseout={animateSplitOut}
			onblur={animateSplitOut}
			class="w-full h-full flex flex-col items-center hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent rounded"
		>
			<div class="w-full h-full">
				<div class="w-full h-full bg-ide-card flex flex-row p-0.5 gap-0.5">
					<div
						bind:this={splitLeftEditor}
						class="w-1/2 transition-all ease-out duration-200 delay-100 h-full flex flex-col gap-0.5 rounded-xs"
					>
						<div
							bind:this={splitRightEditorBottom}
							class="w-full h-2/5 transition-all ease-out duration-200 delay-300 rounded-xs bg-ide-card border border-ide-accent/50"
						></div>
						<div class="w-full grow flex flex-row justify-end rounded-xs bg-ide-card border border-ide-accent/50"></div>
					</div>
					<div class="grow flex flex-col gap-0.5 h-full rounded-xs">
						<div
							bind:this={splitRightEditorTop}
							class="w-full h-3/4 transition-all ease-out duration-200 delay-300 rounded-xs bg-ide-card border border-ide-accent/50"
						></div>
						<div class="w-full grow flex flex-row justify-end rounded-xs bg-ide-card border border-ide-accent/50"></div>
					</div>
				</div>
			</div>
			<span class="px-3 flex justify-center text-xs font-mono text-ide-text-primary">Ide demon</span>
		</button>

		<div class="w-full h-full flex flex-col justify-center items-center">
			<button
				onclick={() => goto('solve/editor')}
				class="w-full h-full flex justify-center items-center bg-ide-card border border-ide-accent/50 rounded-xs hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-ide-accent"
			>
				<CrossIconSvg options={{ class: "h-10 w-10 rotate-45 stroke-ide-text-primary stroke-[4]" }} />
			</button>
			<span class="px-3 flex justify-center text-xs font-mono text-ide-text-primary">Build your own</span>
		</div>
	</div>
</main>