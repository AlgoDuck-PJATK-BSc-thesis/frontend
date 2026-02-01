export type ProblemDto = {
    problemId: string,
    name: string | null,
    createdOn: Date | null,
    createdBy: string | null,
    category: string | null,
    completionRatio: number | null,
    difficulty: string | null,
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


export const QueryableColumns = ["problemId", "name", "createdOn", "createdBy", "category", "completionRatio", "difficulty"] as const;
export type QueryableColumn = (typeof QueryableColumns)[number] & keyof ProblemDto;

export type CategoryPreviewDto = {
    categoryId: string,
    categoryName: string,
    problemCount: number
}

export type ProblemCreatorPreviewDto = {
    id: string,
    username: string,
    email: string,
    selectedAvatar: string,
    problemCreatedCount: number
}
