export const ssr = false;
import { api } from '../_api';

type ProblemSummary = { id: string; title: string; difficulty: string };
type ContestDetail = {
	id: string; name: string; startTime: string; endTime: string;
	problems: ProblemSummary[]; userRank?: number | null;
};

export const load = async ({ params, fetch }) => {
	try {
		const raw = await api<any>(`/api/Contest/${params.contestId}`, {}, fetch);
		const contest: ContestDetail = {
			id: raw.contestId,
			name: raw.contestName,
			startTime: raw.contestStartDateTime,
			endTime: raw.contestEndDateTime,
			userRank: raw.userRank ?? null,
			problems: (raw.problems ?? []).map((p: any) => ({
				id: p.id ?? p.problemId ?? p.contestProblemId ?? String(p),
				title: p.title ?? p.name ?? 'Problem',
				difficulty: p.difficulty ?? 'Unknown'
			}))
		};
		return { contest };
	} catch (e) {
		console.error('Contest detail load failed:', e);

		return { contest: { id: params.contestId, name: 'Contest', startTime: '', endTime: '', problems: [] } };
	}
};
