export const Difficulties = ["EASY", "MEDIUM", "HARD"] as const; 
export type Difficulty = (typeof Difficulties)[number];



export type ProblemListPageLoadArg = {
    problems: ProblemDisplayDto[]
}

export type ProblemDisplayDto = {
    problemId: string, 
    title: string,
    
    difficulty: DifficultyDto,
    tags: TagDto[]
}

type TagDto = {
    name: string
}

type DifficultyDto = {
    name: Difficulty
}
