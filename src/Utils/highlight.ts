import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
hljs.registerLanguage('java', java);

export function highlightJava(code: string): string {
	const highlighted = hljs.highlight(code, { language: 'java' }).value;
	return `<pre class="hljs language-java"><code>${highlighted}</code></pre>`;
}