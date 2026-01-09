import type { problemCreationDto, TestCaseCreateDto } from "./TestCase"

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
    categories: CategoryDto[],
    isEditMode: boolean
    loadedCreateDto?: problemCreationDto,
    problemId: string
}
