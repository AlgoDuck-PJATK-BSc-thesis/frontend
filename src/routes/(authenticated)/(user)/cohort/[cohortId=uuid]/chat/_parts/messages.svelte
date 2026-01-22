<script lang="ts">
	import PixelFrameChat from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameChat.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import LoadingDots from '$lib/Components/Misc/LoadingDots.svelte';
	import { renderMessage } from '../text';
	import type { ChatRun, LocalMessage } from '../types';

	type Status =
		| { kind: 'sending' }
		| { kind: 'delivered' }
		| { kind: 'read'; count: number }
		| null;

	let { runs, defaultAvatar, statusForMessage } = $props<{
		runs: ChatRun[];
		defaultAvatar: string;
		statusForMessage: (m: LocalMessage) => Status;
	}>();
</script>

<div id="chat-scroll" class="flex h-[calc(75vh-6rem)] w-full flex-col overflow-y-auto px-6 py-6">
	{#each runs as run, i}
		<div
			class={`flex w-full ${run.isMine ? 'justify-end' : 'justify-start'} ${i > 0 ? 'mt-[1rem]' : ''}`}
		>
			{#if !run.isMine}
				<div class="relative mt-[1.3rem] mr-2 h-12 w-12 shrink-0">
					<div
						class="h-full w-full overflow-hidden rounded-full border-3 border-white bg-[color:var(--color-primary)] shadow"
					>
						<CloudfrontImage
							path={run.avatarPath ? run.avatarPath : defaultAvatar}
							cls="h-full w-full -translate-x-[-15%] -translate-y-[-5%] scale-[1.5] object-cover object-[left_top]"
						/>
					</div>
				</div>
			{/if}

			<div class={`flex w-full flex-col gap-2 ${run.isMine ? 'items-end' : 'items-start'}`}>
				<span class="text-xs text-[color:var(--color-landingpage-subtitle)]">
					{run.userName}
					{run.timeLabel}
				</span>

				{#each run.items as m}
					<div class={`flex w-full flex-col ${run.isMine ? 'items-end' : 'items-start'}`}>
						<PixelFrameChat
							className={`px-5 py-3 text-sm max-w-[70%] break-words whitespace-normal ${
								run.isMine
									? 'bg-[color:var(--color-chat-right)] text-[color:var(--color-text)] '
									: 'bg-[color:var(--color-chat-left)] text-[color:var(--color-text)] '
							}`}
							side={run.isMine ? 'right' : 'left'}
						>
							{#if m.mediaType === 'Image' && m.mediaUrl}
								<img
									src={m.mediaUrl}
									alt=""
									style="display:block;max-width:100%;height:auto;margin:0 auto;"
									class="h-auto max-h-[14rem] w-auto max-w-[14rem] rounded object-contain"
								/>
							{:else}
								{#await renderMessage(m.content ?? '') then html}{@html html}{/await}
							{/if}
						</PixelFrameChat>

						{#if run.isMine}
							{@const s = statusForMessage(m)}
							{#if s?.kind === 'sending'}
								<div class="mt-1 text-xs text-[color:var(--color-landingpage-subtitle)]">
									<LoadingDots label="Sending" ariaLabel="Sending" />
								</div>
							{:else if s?.kind === 'delivered'}
								<div class="mt-1 text-xs text-[color:var(--color-landingpage-subtitle)]">
									Delivered
								</div>
							{:else if s?.kind === 'read'}
								<div class="mt-1 text-xs text-[color:var(--color-landingpage-subtitle)]">
									Read by {s.count}
								</div>
							{/if}
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	:global(#chat-scroll) {
		scroll-behavior: smooth;
	}
</style>
