<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { Toast } from './ToastStore.svelte';
    import successIconSvg from '$lib/svg/Toast/successIconSvg.svelte';
	import warningIconSvg from '$lib/svg/Toast/warningIconSvg.svelte';
	import errorIconSvg from '$lib/svg/Toast/errorIconSvg.svelte';
	import type { ComponentConfigStatic } from '../GenericComponents/scrollableComponent/ScrollableComponentArgs';
	import type { svgArg } from '$lib/types/ui/GenericArgs/SvgArg';
	import SuccessIconSvg from '$lib/svg/Toast/successIconSvg.svelte';
	import ErrorIconSvg from '$lib/svg/Toast/errorIconSvg.svelte';
	import WarningIconSvg from '$lib/svg/Toast/warningIconSvg.svelte';
	import type { Component } from 'svelte';

	
	
	let { 
		toast, 
		onRemove 
	}: { 
		toast: Toast, 
		onRemove: (id: string) => void 
	} = $props();

	const typeStyles = {
		success: 'bg-green-500 text-white',
		error: 'bg-red-500 text-white',
		warning: 'bg-yellow-500 text-black',
		info: 'bg-blue-500 text-white'
	};

    let icons: Record<string, ComponentConfigStatic<svgArg>> = {
        success: {
            component: SuccessIconSvg,
            options: {
                class: "stroke-green-500 w-6 h-6"
            }
        },
        error: {
            component: ErrorIconSvg,
            options: {
                class: "stroke-red-500 w-6 h-6"
            }
        },
        warning: {
            component: WarningIconSvg,
            options: {
                class: "stroke-amber-500 w-6 h-6"
            }
        }
    }

    let Comp: Component<{ options: svgArg}> = icons[toast.type].component; 
    let compOptions: svgArg = icons[toast.type].options; 

</script>

<div
	in:fly={{ x: 300, duration: 300 }}
	out:fade={{ duration: 200 }}
	class="pointer-events-auto flex fixed top-[20%] right-[1%] items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md bg-bg border-card border-2"
>
    <Comp options={compOptions}/>
	<p class="flex-1 text-sm font-medium">{toast.message}</p>
	<button
		onclick={() => onRemove(toast.id)}
		class="text-xl hover:opacity-70 transition-opacity"
		aria-label="Close notification"
	>
		×
	</button>
</div>