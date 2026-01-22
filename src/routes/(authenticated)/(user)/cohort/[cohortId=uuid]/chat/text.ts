import { highlightJava } from '../../../../../../Utils/highlight';

const escapeHtml = (str: string): string => {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
};

const renderInlineAndText = async (raw: string): Promise<string> => {
	let escaped = escapeHtml(raw);

	const inlinePlaceholders: string[] = [];
	escaped = escaped.replace(/`([^`]+?)`/g, (_m, p1) => {
		const index = inlinePlaceholders.length;
		inlinePlaceholders.push(
			`<code class="px-1 py-1 bg-[color:var(--color-bg)] text-[color:var(--color-text)] font-mono rounded">${escapeHtml(p1)}</code>`
		);
		return `__INLINE_${index}__`;
	});

	escaped = escaped.replace(/\n/g, '<br>');

	inlinePlaceholders.forEach((code, i) => {
		escaped = escaped.replace(`__INLINE_${i}__`, code);
	});

	return escaped;
};

export const renderMessage = async (text: string): Promise<string> => {
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
			segments.push(
				`<div class="p-2 bg-[color:#0d0f14] text-[color:var(--color-text)] overflow-auto rounded text-sm">${highlightJava(code)}</div>`
			);
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
};
