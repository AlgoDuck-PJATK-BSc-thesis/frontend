export function stopPropagation(node: HTMLElement) {
	const handler = (e: Event) => e.stopPropagation();
	node.addEventListener('click', handler);
	return {
		destroy() {
			node.removeEventListener('click', handler);
		}
	};
}