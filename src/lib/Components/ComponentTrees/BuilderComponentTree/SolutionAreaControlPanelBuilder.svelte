<script lang="ts">
	import { activeProfile, ComponentRegistry } from "$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte";
	import type { ControlPanelArgsBuild, Label } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
	import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";

    let { options = $bindable() }: { options: ControlPanelArgsBuild } = $props();

    let items: Label[] = $derived(options.labels.filter(l => l.icon?.component !== undefined))

    let startY: number | undefined = $state();
    let draggedIndex: number | undefined = $state();
    let labelDomElements: Record<string, HTMLButtonElement> = $state({});
    let draggedNode: HTMLButtonElement | undefined = $state();
</script>

<main class="w-12 h-full bg-ide-bg py-3 flex flex-col justify-start items-center gap-3">
    {#each items as label, i}
        {@const Comp = ComponentRegistry.get(activeProfile.profile)!.get(label.icon!.component!)}

        <div class="w-8 h-8 rounded-md relative {options.selectedElemId === label.labelFor ? "stroke-ide-text-secondary border-2 bg-ide-accent/10 border-ide-accent" : "stroke-ide-text-primary bg-ide-bg hover:bg-ide-text-primary/10"}" >
                <button onclick={() => {options.removeComp(label.labelFor)}} class="absolute w-4 h-4 -top-1.5 -right-1.5 z-200 rounded-full bg-ide-bg border border-ide-text-primary">
                    <CrossIconSvg options={{ class: "w-full h-full stroke-[1] stroke-ide-text-primary"}}/>
                </button>   
                <button
                bind:this={labelDomElements[label.labelFor]}
                {@attach node => {
                    const handleMouseMove = (e: MouseEvent) => {
                        if (draggedIndex === undefined || !draggedNode) return;
                        
                        const draggedLabelTop: Label | undefined = items[draggedIndex - 1];
                        const draggedLabelBottom: Label | undefined = items[draggedIndex + 1];

                        const TopContainer: HTMLButtonElement | undefined = draggedLabelTop ? labelDomElements[draggedLabelTop.labelFor] : undefined;
                        const BottomContainer: HTMLButtonElement | undefined = draggedLabelBottom ? labelDomElements[draggedLabelBottom.labelFor] : undefined;

                        if (!startY) {
                            startY = e.clientY;
                        }

                        const dy = e.clientY - startY;
                        draggedNode.style.position = 'absolute';
                        draggedNode.style.transform = `translateY(${dy}px)`;
                        draggedNode.style.zIndex = '9999';

                        const draggedDomRect: DOMRect = draggedNode.getBoundingClientRect();
                        const draggedCenter = draggedDomRect.top + draggedDomRect.height / 2;

                        if (TopContainer) {
                            const TopDomRect: DOMRect = TopContainer.getBoundingClientRect();
                            const topCenter = TopDomRect.top + TopDomRect.height / 2;
                            if (draggedCenter < topCenter) {
                                options.swapCompenets(draggedIndex, draggedIndex - 1);
                                draggedIndex--;
                                return;
                            }
                        }

                        if (BottomContainer) {
                            const bottomDomRect: DOMRect = BottomContainer.getBoundingClientRect();                            
                            const bottomCenter = bottomDomRect.top + bottomDomRect.height / 2;
                            if (draggedCenter > bottomCenter) {
                                options.swapCompenets(draggedIndex, draggedIndex + 1);
                                draggedIndex++;
                                return;
                            }
                        }
                    };

                    const handleMouseDown = (e: MouseEvent) => {
                        draggedIndex = i;
                        draggedNode = node;
                        startY = e.clientY;
                        
                        document.addEventListener('mouseup', handleMouseUp);
                        document.addEventListener('mousemove', handleMouseMove);
                    };

                    const handleMouseUp = () => {
                        document.removeEventListener('mouseup', handleMouseUp);
                        document.removeEventListener('mousemove', handleMouseMove);

                        if (draggedNode) {
                            draggedNode.style.position = '';
                            draggedNode.style.transform = '';
                            draggedNode.style.zIndex = '';
                        }
                        
                        draggedIndex = undefined;
                        draggedNode = undefined;
                        startY = undefined;
                    };

                    node.onmousedown = handleMouseDown;
                }}
                class="w-full h-full cursor-move">
                    {#if draggedIndex !== i}
                        <Comp options={{class: "w-full h-full"}}/>
                    {/if}
                </button>
            </div>
    {/each}
</main>