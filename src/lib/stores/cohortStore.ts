import { writable } from 'svelte/store';

export type CohortContext = {
	cohortId: string | null;
	name: string | null;
	joinCode: string | null;
};

const initial: CohortContext = {
	cohortId: null,
	name: null,
	joinCode: null
};

export const cohortStore = writable<CohortContext>(initial);

export const cohortStoreActions = {
	set: (ctx: CohortContext) => cohortStore.set(ctx),
	clear: () => cohortStore.set(initial)
};
