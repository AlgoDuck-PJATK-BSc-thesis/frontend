import type { StandardResponseDto } from "$lib/api/apiCall"
import type { ProblemDetailsDto } from "$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs"
import type { ChatList } from "$lib/types/domain/modules/problem/assistant"

export type SolvePageLoadArgs = {
    hideHeader: boolean,
    problemLoadResponse: Promise<StandardResponseDto<ProblemDetailsDto>>,
    chatList: Promise<StandardResponseDto<ChatList>>
}