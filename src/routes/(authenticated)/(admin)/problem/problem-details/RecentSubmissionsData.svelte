<script lang='ts'>
	import ErrorIconSvg from "$lib/svg/Toast/ErrorIconSvg.svelte";
	import SuccessIconSvg from "$lib/svg/Toast/SuccessIconSvg.svelte";
    import { type ProblemStatsDto } from "./problemDetailTypes";

    let { data }: { data: ProblemStatsDto } = $props()

    const formatTimeAgo = (dateStr: string): string => {
        const now = new Date();
        const date = new Date(dateStr);
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

</script>
           
<div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
        <div class="flex items-center gap-2.5">
            <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Recent Submissions</h3>
            <span class="text-[10px] font-semibold text-[#858585] bg-[#37373d] px-1.5 py-0.5 rounded-full">
                {data.recentSubmission?.length ?? 0}
            </span>
        </div>
    </div>
    <div class="overflow-x-auto">
        {#if data.recentSubmission?.length > 0}
            <div class="w-full">
                <div class="border-b flex flex-row border-admin-bg-input text-xs text-admin-text-muted uppercase tracking-wider">
                    <div class="text-center w-full px-4 py-2 font-semibold">
                        <span>Status</span>
                    </div>
                    <div class="text-center w-full px-4 py-2 font-semibold">
                        <span>User</span>
                    </div>
                    <div class="text-center w-full px-4 py-2 font-semibold">
                        <span>Runtime</span>
                    </div>
                    <div class="text-center w-full px-4 py-2 font-semibold">
                        <span>Submitted</span>
                    </div>
                    <!-- <div class="text-center w-full px-4 py-2 font-semibold">
                        <span>Actions</span>
                    </div> -->
                </div>
                <div>
                    {#each data.recentSubmission as submission}
                        <div class="border-b border-admin-bg-input flex flex-row last:border-b-0 hover:bg-[#2a2d2e] transition-colors">
                            <div class="px-4 py-3 w-full flex justify-center items-center">
                                <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded">
                                    {console.log(submission.status)}
                                    {#if submission.status === 'Completed'}
                                        <SuccessIconSvg options={{ class: "w-5 h-5 stroke-admin-success stroke-2" }}/>
                                    {:else}
                                        <ErrorIconSvg options={{ class: "w-5 h-5 stroke-admin-danger-bg stroke-2" }}/>
                                    {/if}
                                    <span>{submission.status}</span>
                                </span>
                            </div>
                            <div class="px-4 py-3 w-full flex justify-center items-center">
                                <span class="text-sm ext-admin-text-secondary font-mono">
                                    {submission.username}
                                </span>
                            </div>
                            <div class="px-4 py-3 text-sm w-full flex justify-center items-center text-admin-text-secondary font-mono">
                                {#if submission.runtimeNs === 0}
                                    DNF
                                {:else}
                                    {(submission.runtimeNs / 1_000_000).toFixed(2)}ms
                                {/if}
                            </div>
                            <div class="px-4 py-3 text-sm w-full flex justify-center items-center text-admin-text-muted">
                                {formatTimeAgo(submission.submittedAt)}
                            </div>
                            <!-- <div class="px-4 py-3 w-full flex justify-center items-center">

                            </div> -->
                        </div>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="flex flex-col items-center justify-center py-12 text-admin-text-muted">
                <span class="text-sm">No submissions yet</span>
            </div>
        {/if}
    </div>
</div>