import type { StandardResponseDto } from "$lib/api/apiCall"
import type { AutoSaveDto, ProblemDetailsDto } from "$lib/Components/ComponentTrees/IdeComponentTree/IdeComponentArgs"
import type { ChatList } from "$lib/types/domain/modules/problem/assistant"
import type { EditorConfigData } from "../../../../../routes/(authenticated)/(user)/categories/problems/solve/types"

export type SolvePageLoadArgs = {
    hideHeader: boolean,
    problemLoadResponse: Promise<StandardResponseDto<ProblemDetailsDto>>,
    chatList: Promise<StandardResponseDto<ChatList>>,
    autoSave: Promise<StandardResponseDto<AutoSaveDto | undefined>>
    configData: Promise<StandardResponseDto<EditorConfigData>>
}