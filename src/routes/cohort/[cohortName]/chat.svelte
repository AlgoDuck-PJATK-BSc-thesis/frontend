<script lang="ts">
	import { highlightJava } from '../../../Utils/highlight';
	import PixelFrame from '$lib/Components/LayoutComponents/PixelFrames/PixelFrame.svelte';
	import PixelFrameChat from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameChat.svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';

	import duck from '$lib/images/ducks/duck.png';

	let message = '';
	let messages: { user: string; text: string }[] = [
		{ user: 'duck', text: 'hej' },
		{ user: 'uhu', text: 'co tam' },
		{ user: 'yyy', text: 'hej' },
		{ user: 'yyy', text: 'co tam' },
		{ user: 'you', text: 'no hej' }
	];

	let textareaRef: HTMLTextAreaElement;
	let textResize = 48;

	function send() {
		if (message.trim() === '') return;
		messages = [...messages, { user: 'you', text: message }];
		message = '';
		textareaRef.style.height = 'auto';
		scrollToBottom();
	}

	function scrollToBottom() {
		requestAnimationFrame(() => {
			const el = document.getElementById('chat-scroll');
			el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
		});
	}

	function groupMessages(messages: { user: string; text: string }[]) {
		if (!messages.length) return [];
		const groups = [];
		let current = { user: messages[0].user, texts: [messages[0].text] };
		for (let i = 1; i < messages.length; i++) {
			const msg = messages[i];
			if (msg.user === current.user) {
				current.texts.push(msg.text);
			} else {
				groups.push(current);
				current = { user: msg.user, texts: [msg.text] };
			}
		}
		groups.push(current);
		return groups;
	}

	async function renderMessage(text: string): Promise<string> {
		const segments: string[] = [];
		const codeBlockRegex = /```(\w*)\r?\n([^]*?)```/g;

		console.log('Raw input:', JSON.stringify(text));

		let lastIndex = 0;

		for (const match of text.matchAll(codeBlockRegex)) {
			const fullMatch = match[0];
			const lang = match[1];
			const code = match[2];
			const start = match.index || 0;

			if (start > lastIndex) {
				const before = text.slice(lastIndex, start);
				segments.push(await renderInlineAndText(before));
			}

			if (lang.toLowerCase() === 'java') {
				segments.push(`
					<div class="p-2 bg-[color:#0d0f14] text-[color:var(--color-text)] overflow-auto rounded text-sm">
						${highlightJava(code)}
		            </div>
	           `);
			} else {
				segments.push(
					`<pre class="block w-full whitespace-pre-wrap font-mono text-sm bg-[color:var(--color-bg)] text-[color:var(--color-text)] p-2 rounded overflow-auto">${escapeHtml(code)}</pre>`
				);
			}
			lastIndex = start + fullMatch.length;
		}

		if (lastIndex < text.length) {
			const after = text.slice(lastIndex);
			segments.push(await renderInlineAndText(after));
		}

		return segments.join('');
	}

	async function renderInlineAndText(raw: string): Promise<string> {
		let escaped = escapeHtml(raw);

		const inlinePlaceholders: string[] = [];
		escaped = escaped.replace(/`([^`]+?)`/g, (_m, p1) => {
			const index = inlinePlaceholders.length;
			inlinePlaceholders.push(
				`<code class="px-2 py-1 bg-[color:var(--color-bg)] text-[color:var(--color-text)] font-mono rounded">${escapeHtml(p1)}</code>`
			);
			return `__INLINE_${index}__`;
		});

		escaped = escaped.replace(/\n/g, '<br>');

		inlinePlaceholders.forEach((code, i) => {
			escaped = escaped.replace(`__INLINE_${i}__`, code);
		});

		return escaped;
	}

	function escapeHtml(str: string): string {
		return str
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	function autoResize() {
		if (!textareaRef) return;
		textareaRef.style.height = 'auto';
		const maxHeight = 136;
		const scrollHeight = textareaRef.scrollHeight;
		textareaRef.style.height = Math.min(scrollHeight, maxHeight) + 'px';
	}

	function resizeTextarea() {
		if (!textareaRef) return;

		const lineHeight = 20;
		const padding = 8;
		const baseHeight = lineHeight * 2 + padding * 2;
		const maxHeight = lineHeight * 4 + padding * 2;

		textareaRef.style.height = 'auto';
		const scrollHeight = textareaRef.scrollHeight;
		const finalHeight = Math.min(scrollHeight, maxHeight);
		textResize = finalHeight;
	}
</script>

<div class="relative mt-16 mr-2 ml-13 w-fit">
	<PixelFrame
		className="h-[74vh] w-[66vw] ml-1 mt-8 mr-6 z-4 bg-[linear-gradient(to_bottom,var(--color-accent-3),var(--color-accent-4))]"
	>
		<div class="flex h-full w-full flex-col">
			<div
				id="chat-scroll"
				class="flex h-[calc(75vh-6rem)] w-full flex-col overflow-y-auto px-6 py-6"
			>
				{#each groupMessages(messages) as { user, texts }, i}
					<div
						class={`flex w-full flex-col gap-2 ${user === 'you' ? 'items-end' : 'items-start'} ${i > 0 ? 'mt-[1rem]' : ''}`}
					>
						<span class="text-xs text-[color:var(--color-text)]">{user}</span>
						{#each texts as text}
							<PixelFrameChat
								className={`px-5 py-3 text-sm max-w-[70%] break-words
								${
									user === 'you'
										? 'bg-[color:var(--color-chat-right)] text-[color:var(--color-text)] '
										: 'bg-[color:var(--color-chat-left)] text-[color:var(--color-text)] '
								}
							`}
								side={user === 'you' ? 'right' : 'left'}
							>
								{#await renderMessage(text) then html}
									{@html html}
								{/await}
							</PixelFrameChat>
						{/each}
					</div>
				{/each}
			</div>

			<div
				class="flex h-auto w-full items-end gap-4 border-[color:var(--color-accent-1)] px-6 pt-2 pb-3"
			>
				<div class="relative flex-1">
					<textarea
						bind:this={textareaRef}
						placeholder="Type a message… (use ` for inline code or ``` for simple code block and ```java for Java code block)"
						class="max-h-[8.5rem] min-h-[2.5rem] w-full resize-none overflow-y-auto rounded-xl border border-[color:var(--color-accent-1)] bg-white px-4 py-2 font-sans text-sm text-black"
						bind:value={message}
						on:input={resizeTextarea}
						on:keydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								send();
							}
						}}
					></textarea>
				</div>

				<Button
					size="small"
					label="SEND"
					labelColor="[color:var(--color-text-button)]"
					labelFontSize="1rem"
					labelFontFamily="var(--font-ariw9500)"
					labelFontWeight="normal"
					onclick={send}
				/>
			</div>
		</div>
	</PixelFrame>
</div>

<style>
	:global(#chat-scroll) {
		scroll-behavior: smooth;
	}
</style>
