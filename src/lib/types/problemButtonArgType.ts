import type { ProblemShowcase } from "./ProblemShowcase";

export interface ProblemButtonArgType{
    action: string,
    command: string,
    description: string,
    onclicl: (() => void)
}