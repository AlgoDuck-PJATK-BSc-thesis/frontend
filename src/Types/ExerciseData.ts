export interface ExerciseData{
    template: string,
    description: string,
    name: string,
    testCases: Array<{testData: string, expectedOutput: string}>,
    tags: Array<string>,
}
