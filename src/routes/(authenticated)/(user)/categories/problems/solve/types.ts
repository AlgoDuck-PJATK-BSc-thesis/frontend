import type { EditorThemeName } from "$lib/Themes";

export const Difficulties = ["EASY", "MEDIUM", "HARD"] as const; 
export type Difficulty = (typeof Difficulties)[number];



export type ProblemListPageLoadArg = {
    problems: ProblemDisplayDto[]
}

export type CategoryDto =  {
    categoryId: string,
    name: string,
    problems: ProblemDisplayDto[]
}

export type ProblemDisplayDto = {
    problemId: string, 
    title: string,
    description: string,
    difficulty: DifficultyDto,
    tags: TagDto[],
    attemptedAt?: Date;
    solvedAt?: Date;
}

type TagDto = {
    name: string
}

type DifficultyDto = {
    name: Difficulty
}

export type EditorConfigData = {
    fontSize: number,
    theme: EditorThemeDto,
    layout: LayoutDto /* Record<string, any> would probably suffice but... */
}

export type EditorThemeDto = {
    themeId: string,
    themeName: string
}

export type LayoutDto = {
    layoutName: string,
    layoutId: string,
    layoutContent: any,
}