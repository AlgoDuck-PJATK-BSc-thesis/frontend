export type ProblemDto = {
    problemId: string,
    name: string | null,
    createdOn: Date | null,
    createdBy: string | null,
    completionRatio: number | null,
    difficulty: string | null,
    category: string | null,
}

export type CategoryDto = {
    categoryId: string,
    name: string,
}


export type DifficultyDto = {
    difficultyId: string,
    name: string,
}


export type CreatorDto = {
    id: string,
    username: string,
}

export type ProblemKeys = keyof ProblemDto


export const QueryableColumns =  ["problemId", "name", "createdOn", "createdBy", "completionRatio", "difficulty", "category"] as const;
export type QueryableColumn = (typeof QueryableColumns)[number] & keyof ProblemDto;