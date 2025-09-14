<script lang="ts">
	import InfoPanel from './InfoPanel.svelte';
	import CodeEditor from './CodeEditor/CodeEditor.svelte';
	import RightGutter from './RightGutter.svelte';
	import TopPanel from './TopPanel.svelte';
	import EditorBottomPanel from './CodeEditor/EditorBottomPanel.svelte';
	import type { Problem } from './Types/Problem';
	import SettingsPanel from './Settings/SettingsPanel.svelte';

	let { problemDto }: { problemDto: Problem } = $props();

	let editorContents: string = $state(problemDto.templateContents);

	let ideHolderContainer: HTMLDivElement;
	let informationIdeContainer: HTMLDivElement;
	let programmingIdeContainer: HTMLDivElement;

	let informationIdeProportion = $state(0.25);
	let programmingIdeProportion = $state(0.75);

	let isHorizontallyDragged = false;
	let lastMouseX: number | null = null;
	let isHorizontalBarHovered: boolean = $state(false);

	const handleHorizontalResizeBarMouseDown = () => {
		isHorizontallyDragged = true;
		document.addEventListener('mousemove', handleMouseMoveHorizontal);
		document.addEventListener('mouseup', handleHorizontalResizeBarMouseUp);
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	};

	const handleHorizontalResizeBarMouseUp = () => {
		isHorizontallyDragged = false;
		isHorizontallyDragged = false;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		lastMouseX = null;
	};

	const handleMouseMoveHorizontal = (e: MouseEvent) => {
		if (!isHorizontallyDragged) return;
		if (lastMouseX !== null) {
			const containerWidth = ideHolderContainer.clientWidth;
			const dx = e.clientX - lastMouseX;

			const delta = dx / containerWidth;
			if (informationIdeProportion + delta < 0.95 && programmingIdeProportion - delta > 0.05) {
				informationIdeProportion += delta;
				programmingIdeProportion -= delta;
			}
		}
		lastMouseX = e.clientX;
	};

	let editorIdeContainer: HTMLDivElement;
	let terminalIdeContainer: HTMLDivElement;

	let editorIdeProportion = $state(0.75);
	let terminalIdeProportion = $state(0.25);

	let isVerticallyDragged = false;
	let lastMouseY: number | null = null;
	let isVerticalBarHovered: boolean = $state(false);

	const handleVerticalResizeBarMouseDown = () => {
		isVerticallyDragged = true;
		document.addEventListener('mousemove', handleMouseMoveVertical);
		document.addEventListener('mouseup', handleVerticalResizeBarMouseUp);
		document.body.style.cursor = 'row-resize';
		document.body.style.userSelect = 'none';
	};

	const handleVerticalResizeBarMouseUp = () => {
		isVerticallyDragged = false;
		isVerticalBarHovered = false;
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		lastMouseY = null;
	};

	const handleMouseMoveVertical = (e: MouseEvent) => {
		if (!isVerticallyDragged) return;
		if (lastMouseY !== null) {
			const containerHeight = programmingIdeContainer.clientHeight;
			const dy = e.clientY - lastMouseY;

			const delta = dy / containerHeight;
			if (terminalIdeProportion - delta > 0.05) {
				editorIdeProportion += delta;
				terminalIdeProportion -= delta;
			}
		}
		lastMouseY = e.clientY;
	};

	let isTerminalShown: boolean = $state(true);
	let isTestCasesShown: boolean = $state(false);
	let terminalContents: string = $state('');
	let isExecutingCode: boolean = $state(false);
	let fontSize: number = $state(16);
	let theme: string = $state('vs-dark');
	let isSettingsPanelShown = $state(false);
	$inspect(isSettingsPanelShown);
</script>

<main class="w-full h-[100vh] flex flex-col">
	{#if isSettingsPanelShown}
		<SettingsPanel bind:fontSize bind:theme bind:isSettingsPanelShown />
	{/if}

	<div class="w-full h-[5%]">
		<TopPanel
			executeCallback={() => {
				isExecutingCode = true;
			}}
			submitCallback={() => {
				isExecutingCode = true;
			}}
			isExecuting={isExecutingCode}
			bind:isSettingsPanelShown
		/>
	</div>

	<div class="w-full h-[95%] flex">
		<div bind:this={ideHolderContainer} class="h-full p-1 flex w-[97.5%]">
			<div
				bind:this={informationIdeContainer}
				class="h-full bg-ide-bg text-text-primary rounded-xl overflow-hidden"
				style="flex: {informationIdeProportion}"
			>
				<InfoPanel {problemDto} />
			</div>

			<button
				onmousedown={handleHorizontalResizeBarMouseDown}
				onmouseenter={() => {
					isHorizontalBarHovered = true;
				}}
				onmouseleave={() => {
					if (!isHorizontallyDragged) {
						isHorizontalBarHovered = false;
					}
				}}
				class="h-full w-2.5 bg-transparent flex justify-center items-center"
				aria-label="horizontal-resize-bar"
			>
				{#if isHorizontalBarHovered}
					<div class="w-[30%] h-full bg-blue-600 rounded-full"></div>
				{:else}
					<div class="w-[30%] h-[5%] bg-gray-600 rounded-full"></div>
				{/if}
			</button>

			<div
				bind:this={programmingIdeContainer}
				class="h-full flex flex-col overflow-x-hidden"
				style="flex: {programmingIdeProportion}"
			>
				<div
					bind:this={editorIdeContainer}
					class="w-full rounded-xl overflow-hidden"
					style="flex: {editorIdeProportion}"
				>
					<CodeEditor bind:editorContents {theme} {fontSize} />
				</div>

				<button
					onmousedown={handleVerticalResizeBarMouseDown}
					onmouseenter={() => {
						isVerticalBarHovered = true;
					}}
					onmouseleave={() => {
						if (!isVerticallyDragged) {
							isVerticalBarHovered = false;
						}
					}}
					class="w-full h-2.5 bg-transparent flex-shrink-0 flex-grow-0 flex justify-center items-center"
					aria-label="vertical-resize-bar"
				>
					{#if isVerticalBarHovered}
						<div class="w-full h-[30%] bg-blue-600 rounded-full"></div>
					{:else}
						<div class="w-[5%] h-[30%] bg-gray-600 rounded-full"></div>
					{/if}
				</button>

				<div
					bind:this={terminalIdeContainer}
					class="w-full rounded-xl overflow-hidden"
					style="flex: {terminalIdeProportion}"
				>
					<EditorBottomPanel
						{isTerminalShown}
						{isTestCasesShown}
						testCases={problemDto.testCases}
						bind:terminalContents
					/>
				</div>
			</div>
		</div>

		<div class="h-full w-[2.5%]">
			<RightGutter bind:isTerminalShown bind:isTestCasesShown />
		</div>
	</div>
</main>
