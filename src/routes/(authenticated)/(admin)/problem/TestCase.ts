import type { Component } from "svelte";

export type TestCase = {
    callFunc: MethodRecommendation,
    callArgs: FunctionParam[],
    display: string,
    displayRes: string,
    arrange: string,
    isPublic: boolean,
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
    DisplayComp: Component<{ options: RecommendationDisplayCompArgs<T> }>
}

export type RecommendationDisplayCompArgs<T extends Record<string, any> = {}> = {
    onSelect: (selected: T) => void,
    content: T 
}

export type HeaderOptions = {
    label: string;
}

