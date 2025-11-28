export interface NonProblemButtonArgType{
    action: string,
    command: string,
    description: string,
    onClick: () => void,
}

import type { ProblemShowcase } from "./ProblemShowcase";

export interface ProblemButtonArgType{
    action: string,
    command: string,
    description: string,
    problem: ProblemShowcase,
}