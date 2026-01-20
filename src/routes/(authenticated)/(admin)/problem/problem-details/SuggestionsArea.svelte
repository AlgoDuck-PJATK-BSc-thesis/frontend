<script lang='ts'>
	import TickIconSvg from "$lib/svg/EditorComponentIcons/TickIconSvg.svelte";
	import ErrorIconSvg from "$lib/svg/Toast/ErrorIconSvg.svelte";
	import WarningIconSvg from "$lib/svg/Toast/WarningIconSvg.svelte";
	import type { ProblemStatsDto } from "./problemDetailTypes";

    let { data }: { data: ProblemStatsDto } = $props();


    const dropOffRate = $derived(
        data.churnMetrics.userStartCount > 0 
            ? ((data.churnMetrics.userStartCount - data.churnMetrics.userFinishCount) / data.churnMetrics.userStartCount * 100).toFixed(1)
            : '0'
    );

    const acceptanceRatePercent = $derived((data.attemptMetrics.acceptanceRate * 100).toFixed(1));

</script>

<div class="p-4 flex flex-col gap-3">
    {#if data.attemptMetrics.totalAttempts === 0}
        <div class="flex items-center gap-3 p-3 bg-admin-text-muted/10 border-l-4 border-admin-text-muted rounded-r">
            <WarningIconSvg options={{class:'h-5 w-5 stroke-admin-text-muted stroke-[2]'}}/>
            <div>
                <span class="text-sm font-medium text-admin-text-muted">No Data Yet</span>
                <p class="text-xs text-admin-text-muted mt-1">
                    This problem hasn't received any submissions yet. Insights will appear once users start attempting it.
                </p>
            </div>
        </div>

        {:else}
            {#if data.attemptMetrics.acceptanceRate < 0.20}
                <div class="flex items-center gap-3 p-3 bg-admin-danger-bg/10 border-l-4 border-admin-danger-bg rounded-r">
                    <ErrorIconSvg options={{ class: "w-5 h-5 stroke-admin-danger-bg stroke-2 flex-shrink-0 mt-0.5" }}/>
                    <div>
                        <span class="text-sm font-medium text-admin-danger-text">Low Acceptance Rate</span>
                        <p class="text-xs text-admin-text-muted mt-1">
                            Only {acceptanceRatePercent}% of submissions pass. Consider reviewing problem difficulty or providing additional hints.
                        </p>
                    </div>
                </div>
            {/if}

            {#if Number(dropOffRate) > 70}
                <div class="flex items-center gap-3 p-3 bg-admin-warning/10 border-l-4 border-admin-warning rounded-r">
                    <ErrorIconSvg options={{ class: "w-5 h-5 stroke-admin-warning stroke-2 flex-shrink-0 mt-0.5" }}/>
                    <div>
                        <span class="text-sm font-medium text-admin-warning">High Drop-off Rate</span>
                        <p class="text-xs text-admin-text-muted mt-1">
                            {dropOffRate}% of users who started didn't finish. The problem may be too difficult or unclear.
                        </p>
                    </div>
                </div>
            {/if}

            {#if data.testCaseStats?.some(tc => tc.passRate < 0.30)}
                {@const hardestTC = data.testCaseStats.reduce((min, tc) => tc.passRate < min.passRate ? tc : min)}
                {@const hardestTCIndex = data.testCaseStats.findIndex(tc => tc.testCaseId === hardestTC.testCaseId)}
                <div class="flex items-center gap-3 p-3 bg-admin-accent-primary/10 border-l-4 border-admin-accent-primary rounded-r">
                    <WarningIconSvg options={{class:'h-5 w-5 stroke-admin-text-muted stroke-[2]'}}/>
                    <div>
                        <span class="text-sm font-medium text-admin-accent-primary">Challenging Test Case</span>
                        <p class="text-xs text-admin-text-muted mt-1">
                            Test case {hardestTCIndex + 1} has only {(hardestTC.passRate * 100).toFixed(1)}% pass rate. 
                            This may indicate an edge case that trips up many users.
                        </p>
                    </div>
                </div>
            {/if}

            {#if data.churnMetrics.userSubmitCount > 0 && data.churnMetrics.userFinishCount === 0}
                <div class="flex items-center gap-3 p-3 bg-admin-danger-bg/10 border-l-4 border-admin-danger-bg rounded-r">
                    <ErrorIconSvg options={{ class: "w-5 h-5 stroke-admin-danger-bg stroke-2 flex-shrink-0 mt-0.5" }}/>
                    <div>
                        <span class="text-sm font-medium text-admin-danger-bg">No Successful Completions</span>
                        <p class="text-xs text-admin-text-muted mt-1">
                            {data.churnMetrics.userSubmitCount} users have submitted but none have passed. 
                            Check if test cases are correct or if the problem is solvable.
                        </p>
                    </div>
                </div>
            {/if}

            {#if data.attemptMetrics.acceptanceRate >= 0.20 && Number(dropOffRate) <= 70 && !data.testCaseStats?.some(tc => tc.passRate < 0.30)}
                <div class="flex items-center gap-3 p-3 bg-admin-success/10 border-l-4 border-admin-success rounded-r">
                    <TickIconSvg options={{ class: "w-5 h-5 stroke-admin-success stroke-2 flex-shrink-0 mt-0.5" }}/>
                    <div>
                        <span class="text-sm font-medium text-admin-success">Healthy Metrics</span>
                        <p class="text-xs text-admin-text-muted mt-1">
                            This problem has balanced difficulty with good engagement. No immediate action needed.
                        </p>
                    </div>
                </div>
            {/if}
        {/if}
    
</div>