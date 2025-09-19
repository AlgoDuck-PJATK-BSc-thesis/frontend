import type { ProblemShowcase } from "./ProblemShowcase";

export interface Category{
    name: string,
    problems: ProblemShowcase[],
}
