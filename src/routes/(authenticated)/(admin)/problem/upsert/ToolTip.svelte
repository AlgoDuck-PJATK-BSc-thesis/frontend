<script lang="ts">
	import type { ComponentConfigStatic } from "$lib/Components/GenericComponents/AutoCompleteInput/ComponentConfigStatic";
	import QuestionMarkIconSvg from "$lib/svg/Toast/QuestionMarkIconSvg.svelte";
	import type { svgArg } from "$lib/types/SvgIcon";
	import { fly } from "svelte/transition";

	export type ToolTipOptions = {
		tip: string;
        customIcon?: ComponentConfigStatic<any>,
		svgIconOpts?: svgArg
	};

	let { options }: { options: ToolTipOptions } = $props();

	let parentWidth: number = $state(0);
	let parentLeft: number = $state(0);
	let parentRight: number = $state(0);
	let isVisible: boolean = $state(false);
	let tooltipElement: HTMLDivElement | null = $state(null);
	let triggerElement: HTMLDivElement | null = $state(null);
	let tooltipStyle: string = $state("left: 50%; transform: translateX(-50%);");

	function calculatePosition() {
		if (!tooltipElement || !triggerElement) return;

		const triggerRect = triggerElement.getBoundingClientRect();
		const tooltipRect = tooltipElement.getBoundingClientRect();
		const tooltipWidth = tooltipRect.width;

		const triggerCenterX = triggerRect.left + triggerRect.width / 2;
		const tooltipLeftIfCentered = triggerCenterX - tooltipWidth / 2;
		const tooltipRightIfCentered = triggerCenterX + tooltipWidth / 2;

		if (tooltipLeftIfCentered < parentLeft) {
			const offsetFromTrigger = triggerRect.left - parentLeft;
			tooltipStyle = `left: -${offsetFromTrigger}px; transform: translateX(0);`;
		}
		else if (tooltipRightIfCentered > parentRight) {
			const offsetFromTrigger = parentRight - triggerRect.right;
			tooltipStyle = `right: -${offsetFromTrigger}px; left: auto; transform: translateX(0);`;
		}
		else {
			tooltipStyle = "left: 50%; transform: translateX(-50%);";
		}
	}

	$effect(() => {
		if (isVisible && tooltipElement) {
			requestAnimationFrame(() => {
				calculatePosition();
			});
		}
	});
</script>

<div bind:this={triggerElement}
	{@attach (node) => {
		const parentElement: HTMLElement | null = node.parentElement;
		if (!parentElement) return;
		const parentElementBoundingRect: DOMRect = parentElement.getBoundingClientRect();
		parentWidth = parentElementBoundingRect.width;
		parentLeft = parentElementBoundingRect.left;
		parentRight = parentElementBoundingRect.right;
	}}
	onmouseover={() => {
		isVisible = true;
	}}
	onfocus={() => {
		isVisible = true;
	}}
	onmouseout={() => {
		isVisible = false;
	}}
	onblur={() => {
		isVisible = false;
	}}
	role="button"
	class="relative inline-flex items-center justify-center"
	tabindex="0">
    {#if options.customIcon}
        {@const Icon = options.customIcon.component}
        <Icon options={options.customIcon.options}/>
    {:else}
	    <QuestionMarkIconSvg options={ options.svgIconOpts ?? { class: "w-3 h-3 stroke-[#858585] stroke-[1.5] group-hover:stroke-[#cccccc]" }}/>
    {/if}
	{#if isVisible}
		<div bind:this={tooltipElement}
			transition:fly={{ y: -15, opacity: 0.1 }}
			class="absolute top-[calc(100%+8px)] p-0 m-0 bg-[#2d2d2d] border border-[#3c3c3c] z-[9999] w-max rounded-md"
			style="{tooltipStyle}">
			<div class="px-3.5 py-2.5">
				<p class="m-0 text-xs leading-relaxed whitespace-pre text-[#cccccc]">
					{options.tip}
				</p>
			</div>
		</div>
	{/if}
</div>