<script lang="ts">
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import type { PendingImage } from '../types';

	let {
		message = $bindable(''),
		pending = $bindable([]),
		onFiles,
		onRemove,
		onSend
	} = $props<{
		message?: string;
		pending?: PendingImage[];
		onFiles: (files: File[]) => void;
		onRemove: (id: string) => void;
		onSend: () => void;
	}>();

	let fileInput = $state<HTMLInputElement | null>(null);
	let textareaRef = $state<HTMLTextAreaElement | null>(null);

	const resizeTextarea = () => {
		if (!textareaRef) return;

		const lineHeight = 20;
		const padding = 8;
		const maxHeight = lineHeight * 4 + padding * 2;

		textareaRef.style.height = 'auto';
		const scrollHeight = textareaRef.scrollHeight;
		const finalHeight = Math.min(scrollHeight, maxHeight);
		textareaRef.style.height = `${finalHeight}px`;
	};

	$effect(() => {
		message;
		resizeTextarea();
	});

	const openPicker = () => {
		if (fileInput) {
			try {
				fileInput.value = '';
			} catch {}
		}
		fileInput?.click();
	};

	const onPickImage = (e: Event) => {
		const target = e.currentTarget as HTMLInputElement | null;
		if (!target) return;

		const copied = target.files ? Array.from(target.files) : [];
		try {
			target.value = '';
		} catch {}

		if (copied.length === 0) return;
		onFiles(copied);
	};

	const onKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};
</script>

<div
	class="relative flex h-auto w-full items-end gap-4 border-[color:var(--color-accent-1)] px-6 pt-2 pb-3"
>
	{#if pending.length > 0}
		<div class="absolute right-6 bottom-full left-6 z-50 mb-2 flex flex-wrap gap-2">
			{#each pending as p (p.id)}
				<div class="relative h-[3.5rem] w-[3.5rem]">
					<div
						class="h-full w-full overflow-hidden rounded border border-[color:var(--color-accent-1)] bg-white"
					>
						<img src={p.previewUrl} alt="" class="h-full w-full object-cover" />
					</div>
					<button
						type="button"
						class="absolute -top-2 -right-2 z-50 flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--color-accent-1)] bg-white text-xs text-black"
						aria-label="Remove image"
						onclick={() => onRemove(p.id)}
					>
						x
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		multiple
		class="hidden"
		onchange={onPickImage}
	/>

	<button
		type="button"
		class="order-first h-[2.5rem] w-[2.5rem] self-center rounded-xl border border-[color:var(--color-accent-1)] bg-[color:var(--color-landingpage-subtitle)] text-lg text-[color:var(--color-shadow-black)]"
		onclick={openPicker}
	>
		+
	</button>

	<div class="relative flex-1">
		<textarea
			bind:this={textareaRef}
			placeholder="Type a message… (use ` for inline code or ``` for simple code block and ```java for Java code block)"
			class="max-h-[8.5rem] min-h-[2.5rem] w-full resize-none overflow-y-auto rounded-xl border border-[color:var(--color-accent-1)] bg-[color:var(--color-landingpage-subtitle)] px-4 py-2 text-sm text-[color:var(--color-shadow-black)]"
			bind:value={message}
			oninput={resizeTextarea}
			onkeydown={onKey}
		></textarea>
	</div>

	<div class="translate-y-[-2px]">
		<Button
			size="small"
			label="→"
			labelFontFamily="var(--font-ariw9500)"
			labelColor="rgba(0,0,0,0.7)"
			labelFontSize="2rem"
			labelFontWeight="normal"
			labelTracking="extra"
			labelClass=""
			onclick={onSend}
		/>
	</div>
</div>
