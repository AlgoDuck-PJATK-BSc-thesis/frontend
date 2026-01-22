export const attachActivityListeners = (
	reportActivity: () => void,
	requestSnapshot: () => void
) => {
	if (typeof window === 'undefined') return () => {};

	const onAny = () => {
		reportActivity();
	};

	const onVis = () => {
		if (document.visibilityState === 'visible') {
			reportActivity();
			requestSnapshot();
		}
	};

	window.addEventListener('mousemove', onAny, { passive: true });
	window.addEventListener('keydown', onAny);
	window.addEventListener('touchstart', onAny, { passive: true });
	window.addEventListener('focus', onAny);
	document.addEventListener('visibilitychange', onVis);

	return () => {
		window.removeEventListener('mousemove', onAny as any);
		window.removeEventListener('keydown', onAny as any);
		window.removeEventListener('touchstart', onAny as any);
		window.removeEventListener('focus', onAny as any);
		document.removeEventListener('visibilitychange', onVis as any);
	};
};
