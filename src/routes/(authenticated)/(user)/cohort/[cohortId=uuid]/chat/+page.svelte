<script lang="ts">
	import PixelFrameChat from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameChat.svelte';
	import PixelFrameSimple from '$lib/Components/LayoutComponents/PixelFrames/PixelFrameSimple.svelte';
	import Button from '$lib/Components/ButtonComponents/Button.svelte';
	import CloudfrontImage from '$lib/Components/Misc/CloudfrontImage.svelte';
	import { highlightJava } from '../../../../../../Utils/highlight';
	import { cohortApi, type SendMessageResultDto, type CohortMemberDto } from '$lib/api/cohort';
	import { authApi } from '$lib/api/auth';
	import type { HubConnection } from '@microsoft/signalr';
	import { createInfiniteQuery } from '@tanstack/svelte-query';
	import type { InfiniteData } from '@tanstack/query-core';
	import { derived, get } from 'svelte/store';
	import { page as pageStore } from '$app/stores';
	import { page as pageState } from '$app/state';

	type MessagesPageDto = Awaited<ReturnType<(typeof cohortApi)['getMessages']>>;

	type PageMessageDto = {
		messageId: string;
		userId: string;
		userName: string;
		userAvatarUrl?: string | null;
		content?: string | null;
		mediaType: unknown;
		mediaUrl?: string | null;
		createdAt: string;
		isMine?: boolean;
	};

	const cohortId = $derived(pageState.params.cohortId ?? '');

	const cohortIdStore = derived(
		pageStore,
		($p) => ($p.params as Record<string, string | undefined>).cohortId ?? ''
	);

	let message = $state('');
	let textareaRef = $state<HTMLTextAreaElement | null>(null);
	let textResize = $state(48);

	let conn = $state<HubConnection | null>(null);
	let currentUserId = $state<string | null>(null);

	let members = $state<CohortMemberDto[]>([]);
	let memberAvatarByUserId = $state<Record<string, string | null>>({});

	const defaultAvatar = `Ducks/Outfits/duck-03a4dced-f802-4cc5-b239-e0d4c3be9dcd.png`;

	type LocalMessage = {
		messageId: string;
		userId: string;
		userName: string;
		userAvatarUrl: string | null;
		content: string | null;
		mediaType: 'Text' | 'Image';
		mediaUrl: string | null;
		createdAt: string;
		isMine: boolean;
	};

	type PendingImage = {
		id: string;
		file: File;
		previewUrl: string;
	};

	let pendingImages = $state<PendingImage[]>([]);
	let liveMessages = $state<LocalMessage[]>([]);

	const normalizeMediaType = (mt: unknown): 'Text' | 'Image' => {
		if (mt === 1) return 'Image';
		if (typeof mt === 'string') {
			const v = mt.toLowerCase();
			if (v === 'image') return 'Image';
		}
		return 'Text';
	};

	const queryOptionsStore = derived(cohortIdStore, (id) => ({
		queryKey: ['cohortMessages', id] as const,
		enabled: !!id,
		initialPageParam: null as string | null,
		queryFn: async ({ pageParam }: { pageParam: string | null }) => {
			return await cohortApi.getMessages(id, { beforeCreatedAt: pageParam, pageSize: 50 });
		},
		getNextPageParam: (lastPage: MessagesPageDto) => {
			const lp = lastPage as unknown as { hasMore?: boolean; nextCursor?: string | null };
			if (!lp.hasMore) return undefined;
			return lp.nextCursor ?? undefined;
		}
	}));

	const query = createInfiniteQuery(queryOptionsStore);

	const historyMessages = $derived.by(() => {
		const data = ($query.data ?? undefined) as unknown as
			| InfiniteData<MessagesPageDto, string | null>
			| undefined;

		const pages = (data?.pages ?? []) as unknown as MessagesPageDto[];

		const all = pages.flatMap((p) => {
			const pp = p as unknown as { items?: PageMessageDto[] };
			return pp.items ?? [];
		});

		all.sort(
			(a: PageMessageDto, b: PageMessageDto) =>
				new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
		);

		return all.map((m: PageMessageDto) => ({
			messageId: m.messageId,
			userId: m.userId,
			userName: m.userName,
			userAvatarUrl: (m.userAvatarUrl ?? null) as string | null,
			content: (m.content ?? null) as string | null,
			mediaType: normalizeMediaType(m.mediaType),
			mediaUrl: (m.mediaUrl ?? null) as string | null,
			createdAt: m.createdAt,
			isMine: !!m.isMine
		})) as LocalMessage[];
	});

	const allMessages = $derived.by(() => {
		const merged = [...historyMessages, ...liveMessages];
		const seen = new Set<string>();
		const deduped: LocalMessage[] = [];
		for (const m of merged) {
			if (!m.messageId) continue;
			if (seen.has(m.messageId)) continue;
			seen.add(m.messageId);
			deduped.push(m);
		}
		deduped.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
		return deduped;
	});

	type ChatRun = {
		userId: string;
		userName: string;
		isMine: boolean;
		avatarPath: string | null;
		timeLabel: string;
		items: LocalMessage[];
	};

	const formatTime = (iso: string) =>
		new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	const groupRuns = (msgs: LocalMessage[]): ChatRun[] => {
		const runs: ChatRun[] = [];
		for (const m of msgs) {
			const last = runs[runs.length - 1];
			if (last && last.userId === m.userId) {
				last.items.push(m);
				continue;
			}

			const avatar =
				m.userAvatarUrl ?? memberAvatarByUserId[m.userId] ?? (m.isMine ? null : defaultAvatar);

			runs.push({
				userId: m.userId,
				userName: m.isMine ? 'you' : m.userName,
				isMine: m.isMine,
				avatarPath: avatar ?? null,
				timeLabel: formatTime(m.createdAt),
				items: [m]
			});
		}
		return runs;
	};

	const runs = $derived.by(() => groupRuns(allMessages));

	let fileInput = $state<HTMLInputElement | null>(null);
	let detachScroll = $state<null | (() => void)>(null);

	function scrollToBottom() {
		requestAnimationFrame(() => {
			const el = document.getElementById('chat-scroll');
			el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
		});
	}

	const attachLazyLoad = () => {
		const el = document.getElementById('chat-scroll');
		if (!el) return null;

		const onScroll = async () => {
			if (el.scrollTop > 0) return;

			const q = get(query);
			if (!q.hasNextPage) return;
			if (q.isFetchingNextPage) return;

			const prevHeight = el.scrollHeight;
			await q.fetchNextPage();
			requestAnimationFrame(() => {
				const nextHeight = el.scrollHeight;
				el.scrollTop = nextHeight - prevHeight;
			});
		};

		el.addEventListener('scroll', onScroll);
		return () => el.removeEventListener('scroll', onScroll);
	};

	const refreshMembers = async () => {
		if (!cohortId) return;
		try {
			members = await cohortApi.getAllMembers(cohortId);
			const map: Record<string, string | null> = {};
			for (const m of members) map[m.userId] = m.userAvatarUrl ?? null;
			memberAvatarByUserId = map;
		} catch {}
	};

	const onReceive = (msg: SendMessageResultDto) => {
		const mine = currentUserId ? msg.userId === currentUserId : false;

		const local: LocalMessage = {
			messageId: msg.messageId,
			userId: msg.userId,
			userName: msg.userName,
			userAvatarUrl: msg.userAvatarUrl ?? null,
			content: msg.content ?? null,
			mediaType: normalizeMediaType(msg.mediaType as unknown),
			mediaUrl: msg.mediaUrl ?? null,
			createdAt: msg.createdAt,
			isMine: mine
		};

		liveMessages = [...liveMessages, local];
		scrollToBottom();
	};

	$effect(() => {
		if (!cohortId) return;

		let active = true;

		(async () => {
			try {
				const me = await authApi.me();
				if (active) currentUserId = me.id;
			} catch {
				if (active) currentUserId = null;
			}

			await refreshMembers();

			if (detachScroll) detachScroll();
			detachScroll = attachLazyLoad();

			const nextConn = cohortApi.createChatConnection(cohortId, {
				onReceiveMessage: (msg) => {
					onReceive(msg);
				},
				onMessageRejected: (reason) => {
					alert(reason);
				}
			});

			conn = nextConn;

			try {
				await nextConn.start();
			} catch {}
		})();

		return () => {
			active = false;

			if (detachScroll) detachScroll();
			detachScroll = null;

			const c = conn;
			conn = null;

			if (c) {
				(async () => {
					try {
						await c.stop();
					} catch {}
				})();
			}
		};
	});

	$effect(() => {
		return () => {
			for (const p of pendingImages) {
				try {
					URL.revokeObjectURL(p.previewUrl);
				} catch {}
			}
		};
	});

	const isBindingError = (e: unknown) => {
		const msg = typeof e === 'string' ? e : (e as any)?.message;
		if (!msg || typeof msg !== 'string') return false;
		return msg.includes('Error binding arguments') || msg.includes('InvalidDataException');
	};

	const invokeSendMessage = async (payload: {
		cohortId: string;
		content: string | null;
		mediaType: 0 | 1;
		mediaKey: string | null;
		mediaContentType: string | null;
	}) => {
		const c = conn;
		if (!c) throw new Error('Chat connection is not available.');

		const oneArg = {
			cohortId: payload.cohortId,
			content: payload.content,
			input: payload.content,
			message: payload.content,
			text: payload.content,
			mediaType: payload.mediaType,
			mediaKey: payload.mediaKey,
			mediaContentType: payload.mediaContentType
		};

		const withoutCohortId = {
			content: payload.content,
			input: payload.content,
			message: payload.content,
			text: payload.content,
			mediaType: payload.mediaType,
			mediaKey: payload.mediaKey,
			mediaContentType: payload.mediaContentType
		};

		try {
			await c.invoke('SendMessage', oneArg);
			return;
		} catch (e) {
			if (!isBindingError(e)) throw e;
		}

		try {
			await c.invoke('SendMessage', payload.cohortId, withoutCohortId);
			return;
		} catch (e) {
			if (!isBindingError(e)) throw e;
		}

		await c.invoke('SendMessage', withoutCohortId);
	};

	async function sendTextMessage(text: string) {
		if (!cohortId) return;

		const payload = {
			cohortId,
			content: text,
			mediaType: 0 as const,
			mediaKey: null,
			mediaContentType: null
		};

		try {
			await invokeSendMessage(payload);
		} catch (err) {
			if (!isBindingError(err)) throw err;

			await cohortApi.sendMessageRest(cohortId, {
				content: text,
				input: text,
				message: text,
				text: text,
				mediaType: 'Text',
				mediaKey: null,
				mediaContentType: null
			} as any);
		}
	}

	async function sendImageMessage(file: File) {
		if (!cohortId) return;

		const uploaded = await cohortApi.uploadChatMedia(cohortId, file);

		const payload = {
			cohortId,
			content: null,
			mediaType: 1 as const,
			mediaKey: uploaded.mediaKey,
			mediaContentType: uploaded.contentType
		};

		try {
			await invokeSendMessage(payload);
		} catch (err) {
			if (!isBindingError(err)) throw err;

			await cohortApi.sendMessageRest(cohortId, {
				content: null,
				input: null,
				message: null,
				text: null,
				mediaType: 'Image',
				mediaKey: uploaded.mediaKey,
				mediaContentType: uploaded.contentType
			} as any);
		}
	}

	async function sendAll() {
		if (!cohortId) return;

		const text = message.trim();
		const imgs = [...pendingImages];

		if (text === '' && imgs.length === 0) return;

		if (text !== '') {
			try {
				await sendTextMessage(text);
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				alert(msg);
				return;
			}
		}

		message = '';
		if (textareaRef) textareaRef.style.height = 'auto';

		if (imgs.length > 0) {
			let remaining: PendingImage[] = [];

			for (let i = 0; i < imgs.length; i++) {
				const p = imgs[i];
				try {
					await sendImageMessage(p.file);
					try {
						URL.revokeObjectURL(p.previewUrl);
					} catch {}
				} catch (err) {
					const msg = err instanceof Error ? err.message : String(err);
					alert(msg);
					remaining = imgs.slice(i);
					break;
				}
			}

			pendingImages = remaining;
		}

		scrollToBottom();
	}

	function openPicker() {
		fileInput?.click();
	}

	function addFiles(files: FileList) {
		const next: PendingImage[] = [];
		for (const file of Array.from(files)) {
			if (!file.type.startsWith('image/')) continue;
			const id =
				typeof crypto !== 'undefined' && 'randomUUID' in crypto
					? crypto.randomUUID()
					: `${Date.now()}-${Math.random()}`;
			const previewUrl = URL.createObjectURL(file);
			next.push({ id, file, previewUrl });
		}
		if (next.length > 0) pendingImages = [...pendingImages, ...next];
	}

	function removePending(id: string) {
		const found = pendingImages.find((p) => p.id === id);
		if (found) {
			try {
				URL.revokeObjectURL(found.previewUrl);
			} catch {}
		}
		pendingImages = pendingImages.filter((p) => p.id !== id);
	}

	async function onPickImage(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		const files = target.files;
		target.value = '';
		if (!files || files.length === 0) return;
		addFiles(files);
	}

	async function renderMessage(text: string): Promise<string> {
		const segments: string[] = [];
		const codeBlockRegex = /```(\w*)\r?\n([^]*?)```/g;

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

	function resizeTextarea() {
		if (!textareaRef) return;

		const lineHeight = 20;
		const padding = 8;
		const maxHeight = lineHeight * 4 + padding * 2;

		textareaRef.style.height = 'auto';
		const scrollHeight = textareaRef.scrollHeight;
		const finalHeight = Math.min(scrollHeight, maxHeight);
		textResize = finalHeight;
	}
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
			<div
				id="chat-scroll"
				class="flex h-[calc(75vh-6rem)] w-full flex-col overflow-y-auto px-6 py-6"
			>
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

						<div class={`flex flex-col gap-2 ${run.isMine ? 'items-end' : 'items-start'}`}>
							<span class="text-xs text-[color:var(--color-landingpage-subtitle)]">
								{run.userName}
								{run.timeLabel}
							</span>

							{#each run.items as m}
								<PixelFrameChat
									className={`px-5 py-3 text-sm max-w-[70%] break-words
									${
										run.isMine
											? 'bg-[color:var(--color-chat-right)] text-[color:var(--color-text)] '
											: 'bg-[color:var(--color-chat-left)] text-[color:var(--color-text)] '
									}
								`}
									side={run.isMine ? 'right' : 'left'}
								>
									{#if m.mediaType === 'Image' && m.mediaUrl}
										<img
											src={m.mediaUrl}
											alt=""
											class="h-auto max-h-[14rem] w-auto max-w-[14rem] rounded object-contain"
										/>
									{:else}
										{#await renderMessage(m.content ?? '') then html}
											{@html html}
										{/await}
									{/if}
								</PixelFrameChat>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div
				class="relative flex h-auto w-full items-end gap-4 border-[color:var(--color-accent-1)] px-6 pt-2 pb-3"
			>
				{#if pendingImages.length > 0}
					<div class="absolute right-6 bottom-full left-6 z-50 mb-2 flex flex-wrap gap-2">
						{#each pendingImages as p (p.id)}
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
									onclick={() => removePending(p.id)}
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
						class="max-h-[8.5rem] min-h-[2.5rem] w-full resize-none overflow-y-auto rounded-xl border border-[color:var(--color-accent-1)] bg-[color:var(--color-landingpage-subtitle)] px-4 py-2 font-sans text-sm text-[color:var(--color-shadow-black)]"
						bind:value={message}
						oninput={resizeTextarea}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault();
								sendAll();
							}
						}}
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
						onclick={sendAll}
					/>
				</div>
			</div>
		</div>
	</PixelFrameSimple>
</div>

<style>
	:global(#chat-scroll) {
		scroll-behavior: smooth;
	}
</style>
