export type DifficultyDto = {
    id: string,
    name: string
}

export type CategoryDto = {
    categoryId: string,
    categoryName: string
}

export type ProblemCreatePageArgs = {
    difficulties: DifficultyDto[],
    categories: CategoryDto[]
}
