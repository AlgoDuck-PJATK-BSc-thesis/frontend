export const ui = $state({
	mode: 'retro' as 'retro' | 'modern'
});

if (typeof localStorage !== 'undefined') {
	const saved = localStorage.getItem('ui-mode');
	if (saved === 'retro' || saved === 'modern') {
		ui.mode = saved;
	}
}

$effect.root(() => {
	if (typeof localStorage === 'undefined') return;
	$effect(() => {
		localStorage.setItem('ui-mode', ui.mode);
	});
});
