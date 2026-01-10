<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { Toast } from './ToastStore.svelte';
	import type { Component } from 'svelte';
	import type { svgArg } from '$lib/types/SvgIcon';
	import SuccessIconSvg from '$lib/svg/Toast/SuccessIconSvg.svelte';
	import ErrorIconSvg from '$lib/svg/Toast/ErrorIconSvg.svelte';
	import WarningIconSvg from '$lib/svg/Toast/WarningIconSvg.svelte';
	import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';
	import type { ComponentConfigStatic } from '../GenericComponents/AutoCompleteInput/ComponentConfigStatic';

	let { 
		toast, 
		onRemove 
	}: { 
		toast: Toast, 
		onRemove: (id: string) => void 
	} = $props();

    let icons: Record<string, ComponentConfigStatic<svgArg>> = {
        success: {
            component: SuccessIconSvg,
            options: {
                class: "stroke-green-500 stroke-[2] w-6 h-6"
            }
        },
        error: {
            component: ErrorIconSvg,
            options: {
                class: "stroke-red-500 stroke-[2] w-6 h-6"
            }
        },
        warning: {
            component: WarningIconSvg,
            options: {
                class: "stroke-amber-500 stroke-[2] w-6 h-6"
            }
        }
    }

    let Comp: Component<{ options: svgArg}> = icons[toast.type].component; 
    let compOptions: svgArg = icons[toast.type].options; 

</script>

<div
	in:fly={{ x: 300, duration: 300 }}
	out:fade={{ duration: 200 }}
	class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md bg-white text-black border-2"
>
    <Comp options={compOptions}/>
	<p class="flex-1 text-sm font-medium">{toast.message}</p>
	<button
		onclick={() => onRemove(toast.id)}
		class="text-xl hover:bg-black/10 transition-colors ease-out duration-250 p-2 rounded-[25%]"
		aria-label="Close notification"
	>
		<CrossIconSvg options={{class: 'w-4 h-4 stroke-[2] stroke-black'}}/>
	</button>
</div>