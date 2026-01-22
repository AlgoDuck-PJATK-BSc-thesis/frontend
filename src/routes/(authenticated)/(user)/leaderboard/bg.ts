import type { BgSegment } from './types';

export const computeBackground = (
	scrollEl: HTMLElement | null,
	gifRatio: number,
	gif1: string,
	gif2: string,
	gif3: string
): { bgHeight: number; segments: BgSegment[] } => {
	const vh = scrollEl?.clientHeight ?? 0;
	const vw = scrollEl?.clientWidth ?? 0;
	const sh = scrollEl?.scrollHeight ?? 0;

	const viewportH = Math.max(1, vh);
	const viewportW = Math.max(1, vw);
	const scrollH = Math.max(viewportH, sh);

	const tileH = Math.max(viewportH, Math.round(viewportW * gifRatio));
	const needsScroll = scrollH > viewportH + 2;

	if (!needsScroll) {
		return { bgHeight: viewportH, segments: [{ src: gif1, top: 0, h: tileH }] };
	}

	const count = Math.max(1, Math.ceil(scrollH / tileH));
	const segments = Array.from({ length: count }, (_: unknown, i: number) => ({
		src: i === 0 ? gif1 : i % 2 === 1 ? gif2 : gif3,
		top: i * tileH,
		h: tileH
	}));

	return { bgHeight: scrollH, segments };
};
