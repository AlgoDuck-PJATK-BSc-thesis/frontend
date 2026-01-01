<script lang="ts">
    import { activeProfile, ComponentRegistry } from "$lib/Components/GenericComponents/layoutManager/ComponentRegistry.svelte";
    import type { ControlPanelArgsBuild, Label } from "$lib/Components/GenericComponents/layoutManager/ResizableComponentArg";
    import CrossIconSvg from "$lib/svg/CrossIconSvg.svelte";

    let { options = $bindable() }: { options: ControlPanelArgsBuild } = $props();

    let sourceLabels: Label[] = $derived(options.labels.filter(l => l.icon?.component !== undefined));
    
    let renderOrder: string[] = $state([]);
    
    $effect(() => {
        const currentIds = new Set(sourceLabels.map(l => l.labelFor));
        const renderIds = new Set(renderOrder);
        
        const validOrder = renderOrder.filter(id => currentIds.has(id));
        
        const newIds = sourceLabels
            .filter(l => !renderIds.has(l.labelFor))
            .map(l => l.labelFor);
        
        if (validOrder.length !== renderOrder.length || newIds.length > 0) {
            renderOrder = [...validOrder, ...newIds];
        }
    });
    
    let labelMap: Map<string, Label> = $derived(new Map(sourceLabels.map(l => [l.labelFor, l])));
    
    let orderedItems: Label[] = $derived(
        renderOrder
            .map(id => labelMap.get(id))
            .filter((l): l is Label => l !== undefined)
    );

    let dragState = $state<{
        isDragging: boolean;
        draggedId: string | null;
        draggedIndex: number;
        startY: number;
        currentY: number;
    }>({
        isDragging: false,
        draggedId: null,
        draggedIndex: -1,
        startY: 0,
        currentY: 0
    });
    
    let itemElements: Record<string, HTMLDivElement> = {};

    const handleDragStart = (e: MouseEvent, labelFor: string, index: number) => {
        e.preventDefault();
        dragState = {
            isDragging: true,
            draggedId: labelFor,
            draggedIndex: index,
            startY: e.clientY,
            currentY: e.clientY
        };
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    };

    const handleDragMove = (e: MouseEvent) => {
        if (!dragState.isDragging || dragState.draggedId === null) return;
        
        dragState.currentY = e.clientY;
        
        const currentIndex = dragState.draggedIndex;
        const draggedElement = itemElements[dragState.draggedId];
        
        if (!draggedElement) return;
        
        const draggedRect = draggedElement.getBoundingClientRect();
        const draggedCenter = draggedRect.top + draggedRect.height / 2;

        if (currentIndex > 0) {
            const aboveId = renderOrder[currentIndex - 1];
            const aboveElement = itemElements[aboveId];
            if (aboveElement) {
                const aboveRect = aboveElement.getBoundingClientRect();
                const aboveCenter = aboveRect.top + aboveRect.height / 2;
                
                if (draggedCenter < aboveCenter) {
                    swapItems(currentIndex, currentIndex - 1);
                    return;
                }
            }
        }
        
        if (currentIndex < renderOrder.length - 1) {
            const belowId = renderOrder[currentIndex + 1];
            const belowElement = itemElements[belowId];
            if (belowElement) {
                const belowRect = belowElement.getBoundingClientRect();
                const belowCenter = belowRect.top + belowRect.height / 2;
                
                if (draggedCenter > belowCenter) {
                    swapItems(currentIndex, currentIndex + 1);
                    return;
                }
            }
        }
    };

    const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        dragState = {
            isDragging: false,
            draggedId: null,
            draggedIndex: -1,
            startY: 0,
            currentY: 0
        };
    };

    const swapItems = (fromIndex: number, toIndex: number) => {
        const newOrder = [...renderOrder];
        [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
        renderOrder = newOrder;
        dragState.draggedIndex = toIndex;
        
        dragState.startY = dragState.currentY;
        
        if (options.swapComponents) {
            options.swapComponents(fromIndex, toIndex);
        }
    };

    const handleRemove = (e: MouseEvent, labelFor: string) => {
        e.stopPropagation();
        if (options.removeComp) {
            options.removeComp(labelFor);
        }
        renderOrder = renderOrder.filter(id => id !== labelFor);
    };

    const handleSelect = (labelFor: string) => {
        if (options.controlCallbacks?.select) {
            options.controlCallbacks.select(labelFor);
        }
    };

    const getDragTransform = (labelFor: string): string => {
        if (dragState.isDragging && dragState.draggedId === labelFor) {
            const dy = dragState.currentY - dragState.startY;
            return `translateY(${dy}px)`;
        }
        return '';
    };

    const isDragged = (labelFor: string): boolean => {
        return dragState.isDragging && dragState.draggedId === labelFor;
    };
</script>

<main class="w-12 h-full bg-ide-bg py-3 flex flex-col justify-start items-center gap-3">
    {#each orderedItems as label, i (label.labelFor)}
        {@const Comp = ComponentRegistry.get(activeProfile.profile)?.get(label.icon?.component ?? '')}
        {@const isSelected = options.selectedElemId === label.labelFor}
        {@const isBeingDragged = isDragged(label.labelFor)}
        
        <div 
            bind:this={itemElements[label.labelFor]}
            class="w-8 h-8 rounded-md relative
                {isSelected ? 'stroke-ide-text-secondary border-2 bg-ide-accent/10 border-ide-accent' : 'stroke-ide-text-primary bg-ide-bg hover:bg-ide-text-primary/10'}
                {isBeingDragged ? 'z-50 shadow-lg scale-110' : ''}"
            style="transform: {getDragTransform(label.labelFor)};"
        >
            <button 
                onclick={(e) => handleRemove(e, label.labelFor)} 
                class="absolute w-4 h-4 -top-1.5 -right-1.5 z-[200] rounded-full bg-ide-bg border border-ide-text-primary hover:bg-red-500/20 hover:border-red-500 transition-colors"
            >
                <CrossIconSvg options={{ class: "w-full h-full stroke-[1] stroke-ide-text-primary"}}/>
            </button>
            
            <button
                onmousedown={(e) => handleDragStart(e, label.labelFor, i)}
                onclick={() => !dragState.isDragging && handleSelect(label.labelFor)}
                class="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
            >
                {#if Comp && !isBeingDragged}
                    <Comp options={{class: "w-full h-full"}}/>
                {:else if Comp && isBeingDragged}
                    <Comp options={{class: "w-full h-full opacity-70"}}/>
                {/if}
            </button>
        </div>
    {/each}
    
    {#if orderedItems.length === 0}
        <div class="w-8 h-8 rounded-md border-2 border-dashed border-ide-text-primary/30 flex items-center justify-center">
            <span class="text-xs text-ide-text-primary/50">+</span>
        </div>
    {/if}
</main>