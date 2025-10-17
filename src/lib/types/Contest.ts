export type ProblemSummary = { id: string; title: string; difficulty: string };

export type ContestDetail = {
	id: string;
	name: string;
	startTime: string;
	endTime: string;
	problems: ProblemSummary[];
	userRank?: number | null;
};
