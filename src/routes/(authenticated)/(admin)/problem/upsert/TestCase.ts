import type { Component } from "svelte";

export type TestCaseCreateDto = {
    display: string,
    displayRes: string,
    arrangeB64: string,
    callMethod: MethodRecommendation,
    callArgs: (FunctionParam | undefined)[],
    expected: FunctionParam,
    isPublic: boolean,
    orderMatters: boolean,
}

export type MethodRecommendation = {
    methodName: string,
    qualifiedName: string,
    functionParams: FunctionParam[],
    generics: string[],
    modifiers: string[],
    accessModifier: string,
    returnType: string
}

export type FunctionParam = {
    type: string,
    name: string
}

export type SuggestedInputArgs<T extends Record<string, any>> = {
    onSelect: (selected: T) => void,
    getCurrentRecommendationsForQuery: (prefix: string) => T[] | undefined;
    DisplayComp: Component<{ options: RecommendationDisplayCompArgs<T> }>;
    onDeselect?: (() => void)
    SelectedDisplayComp?: Component<{ options: RecommendationDisplayCompArgs<T> }>;
    defaultSelected?: T
}

export type RecommendationDisplayCompArgs<T extends Record<string, any> = {}> = {
    onSelect: (selected: T) => void,
    content: T 
}

export type HeaderOptions = {
    label: string;
}

export type problemCreationDto = {
    testCaseId: string,
    templateB64: string,
    problemTitle: string,
    problemDescription: string,
    difficultyId: string,
    categoryId: string,
    tags: TagCreateDto[],
    testCases: TestCaseCreateDto[]
}

export type TagCreateDto = {
    tagName: string
}

export type AnalysisResultDto = {
    methods: MethodRecommendation[],
    variables: VariableRecommendation[]
}

export type VariableRecommendation = {
    type: string,
    name: string
}

export const IntermediateValidationStatus = ["Queued", "Pending"] as const;
export const TerminalValidationStatuses = ["Succeeded", "Failed"] as const;

export type IntermediateValidationStatus = (typeof IntermediateValidationStatus)[number];
export type TerminalValidationStatus = (typeof TerminalValidationStatuses)[number];

export type ValidationResponseStatus = IntermediateValidationStatus | TerminalValidationStatus;

export const isIntermediateValidationStatus = (status?: ValidationResponseStatus) => {
    return status === "Pending" || status === "Queued"
}


export const isTerminalValidationStatus = (status?: ValidationResponseStatus) => {
    return status === "Succeeded" || status === "Failed"
}



export type ValidationResponse = {
    status: ValidationResponseStatus,
    message: string
}

export type JobData = {
    problemId: string,
    commissioningUserId: string,
    cachedResponses: ValidationResponse[]
}

export type CreateUnverifiedProblemDto = {
    jobId: string,
    problemId: string
}