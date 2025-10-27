	export const ssr = false;
	import { api } from './_api';

	type Contest = {
		id: string;
		name: string;
		startTime: string;
		endTime: string;
	};


	export const load = async ({ fetch }: { fetch: typeof globalThis.fetch }) => {
		try {
			const raw = await api<any[]>('/api/Contest', {}, fetch);
			const contests: Contest[] = (raw ?? []).map((c: any) => ({
				id: c.contestId,
				name: c.contestName,
				startTime: c.contestStartDateTime,
				endTime: c.contestEndDateTime
			}));

			const now = new Date();
			const active = contests.filter((c) => new Date(c.endTime) > now);
			const inactive = contests.filter((c) => new Date(c.endTime) <= now);

			return { active, inactive };
		} catch (e) {
			console.error('Contest list load failed:', e);
			return { active: [], inactive: [] };
		}
	};
