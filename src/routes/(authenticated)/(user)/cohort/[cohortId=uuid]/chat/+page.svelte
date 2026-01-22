<script lang="ts">
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import { page as pageState } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import { writable } from 'svelte/store';

	import Messages from './_parts/messages.svelte';
	import Input from './_parts/input.svelte';
	import { createCohortChatModel } from './_logic/model';

	const defaultAvatar = `Ducks/Outfits/duck-016a1fce-3d78-46cd-8b25-b0f911c55644.png`;

	const cohortIdStore = writable('');

	$effect(() => {
		cohortIdStore.set((pageState.params.cohortId ?? '').toString());
	});

	const chat = createCohortChatModel({ cohortId: cohortIdStore, defaultAvatar });

	const { runs, message, pendingImages, statusForMessage, onFiles, onRemove, sendAll } = chat;

	onMount(() => {
		chat.mount();
	});

	onDestroy(() => {
		chat.destroy();
	});
</script>

<div class="relative mt-[3rem] mr-2 ml-[3rem] w-fit">
	<div class=" -mt-[1rem] mb-[1rem] flex justify-center">
		<h1
			class="ocr-outline ocr-title isolate [font-family:var(--font-ariw9500)] text-6xl font-black tracking-widest text-[var(--color-landingpage-title)]"
		>
			Chat
		</h1>
	</div>

	<PixelFrameSimple
		className="h-[74vh] w-[62vw] ml-1 mt-1 mr-6 z-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<div class="flex h-full w-full flex-col">
			<Messages runs={$runs} {defaultAvatar} {statusForMessage} />
			<Input
				bind:message={$message}
				bind:pending={$pendingImages}
				{onFiles}
				{onRemove}
				onSend={sendAll}
			/>
		</div>
	</PixelFrameSimple>
</div>
