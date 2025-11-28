export type ProblemDetailsDto = {
  problemId: string,
  title: string,
  description: string,
  category: CategoryDto,
  difficulty: DifficultyDto,
  templateContents: string,
  testCases: TestCase[],
  tags: TagDto[]
}

export type CategoryDto = {
  name: string
}

export type DifficultyDto = {
  name: string
}

export type TestCase = {
  testCaseId: string,
  display: string,
  displayRes: string,
  isPublic: boolean
  isPassed?: boolean
}

export type TagDto = {
    name: string
}