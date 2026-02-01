<script lang="ts">
    import { Chart, registerables } from 'chart.js';
    import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";
    import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";
	import { PerformanceTabs, type PerformanceTab, type ProblemStatsDto } from "./problemDetailTypes";
	import PenIconSvg from '$lib/svg/EditorComponentIcons/PenIconSvg.svelte';
	import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';
	import { adminThemes, rgbToHex, rgbToRgba } from '$lib/Themes/AdminThemes';
	import { CurrentAdminTheme } from '$lib/Themes/AdminThemes/currentAdminTheme.svelte';
	import DeletionModal from './DeletionModal.svelte';
	import ToolTip from '../upsert/ToolTip.svelte';
	import { drawAcceptanceRatOverTimeChart } from './Charts/AcceptanceRateOverTimeChart';
	import { drawTestCaseChart } from './Charts/DrawTestCaseChart';
	import { drawRuntimeChart } from './Charts/DrawRuntimeChart';
	import { drawChurnChart } from './Charts/DrawChurnChart';
	import { drawMemoryChart } from './Charts/DrawMemoryChart';
	import SuggestionsArea from './SuggestionsArea.svelte';
	import RecentSubmissionsData from './RecentSubmissionsData.svelte';

    Chart.register(...registerables);

    let { data }: { data: ProblemStatsDto } = $props();

    $inspect(data);

    let chartColors = $derived({
        primary: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-accent-primary']),
        primaryLight: rgbToRgba(adminThemes[CurrentAdminTheme.theme]['--color-admin-accent-primary'], 0.2),
        success: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-success']),
        successLight: rgbToRgba(adminThemes[CurrentAdminTheme.theme]['--color-admin-success'], 0.2),
        warning: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-warning']),
        warningLight: rgbToRgba(adminThemes[CurrentAdminTheme.theme]['--color-admin-warning'], 0.2),
        danger: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-danger-text']),
        dangerLight: rgbToRgba(adminThemes[CurrentAdminTheme.theme]['--color-admin-danger-text'], 0.2),
        muted: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-text-muted']),
        mutedLight: rgbToRgba(adminThemes[CurrentAdminTheme.theme]['--color-admin-text-muted'], 0.2),
        grid: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-border-primary']),
        text: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-text-secondary']),
        bgSecondary: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-bg-secondary']),
        bgTertiary: rgbToHex(adminThemes[CurrentAdminTheme.theme]['--color-admin-bg-tertiary']),
    });

    const chartDefaults = $derived({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: chartColors.text, font: { family: 'inherit', size: 11 } }
            }
        },
        scales: {
            x: {
                grid: { color: chartColors.grid, drawBorder: false },
                ticks: { color: chartColors.muted, font: { size: 10 } }
            },
            y: {
                grid: { color: chartColors.grid, drawBorder: false },
                ticks: { color: chartColors.muted, font: { size: 10 } }
            }
        }
    });

    const Tabs = ['Churn', 'Timeseries'] as const;
    type Tab = (typeof Tabs)[number];

    let currentTab: Tab = $state("Churn");

    const formatMemoryKb = (kb: number): string => {
        if (kb < 1024) return `${kb.toFixed(0)} KB`;
        return `${(kb / 1024).toFixed(1)} MB`;
    };

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString();
    };

    const dropOffRate = $derived(
        data.churnMetrics.userStartCount > 0 
            ? ((data.churnMetrics.userStartCount - data.churnMetrics.userFinishCount) / data.churnMetrics.userStartCount * 100).toFixed(1)
            : '0'
    );

    const acceptanceRatePercent = $derived((data.attemptMetrics.acceptanceRate * 100).toFixed(1));

    let currentlyPreviewedPerformanceTab: PerformanceTab = $state("Runtime")
    let isDeletionModalVisible: boolean = $state(false);

</script>

<svelte:head>
	<title>Admin - Algoduck</title>
</svelte:head>

{#if isDeletionModalVisible}
    <DeletionModal bind:isVisible={isDeletionModalVisible} problemId={data.problemDetailsCore.problemId}/>
{/if}
{#key CurrentAdminTheme.theme}
    <main class="w-full grow bg-admin-bg-primary text-admin-text-muted">
        <div class="max-w-7xl mx-auto p-6 flex grow flex-col gap-6">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-admin-bg-input">
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-3">
                        <a href="/problem" class="text-admin-text-muted hover:text-admin-text-primary transition-colors">
                            <ChevronIconSvgNew options={{ class: "w-5 h-5 stroke-current stroke-2 rotate-180" }}/>
                        </a>
                        <h1 class="text-2xl font-normal text-admin-text-primary tracking-tight">
                            {data.problemDetailsCore.problemName}
                        </h1>
                        <span class="text-xs font-semibold px-2 py-1 rounded uppercase tracking-wider text-admin-text-muted bg-admin-bg-input">
                            {data.problemDetailsCore.difficulty.name}
                        </span>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-admin-text-muted">
                        <span class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-admin-accent-primary"></span>
                            {data.problemDetailsCore.category.name}
                        </span>
                        <span>Created {formatDate(data.problemDetailsCore.createdAt)}</span>
                        {#if data.problemDetailsCore.lastUpdatedAt}
                            <span>Updated {formatDate(data.problemDetailsCore.lastUpdatedAt)}</span>
                        {/if}
                        <span class="text-[10px] font-mono flex flex-row gap-0.5 item-center text-admin-text-muted items-center bg-admin-bg-input px-1.5 py-0.5 rounded">
                            <span>{data.problemDetailsCore.difficulty.rewardScaler}</span> <CrossIconSvg options={{class:'w-2 h-2 stroke-admin-text-muted stroke-[2]'}}/> <span>Rewards</span>
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <a href="/problem/upsert?problemId={data.problemDetailsCore.problemId}&edit=true"
                        class="flex items-center gap-2 px-4 py-2 bg-admin-bg-secondary border border-admin-bg-input text-admin-text-secondary text-sm rounded-sm cursor-pointer transition-colors hover:bg-admin-bg-tertiary">
                        <PenIconSvg options={{ class: "w-4 h-4 stroke-current stroke-2" }}/>
                        <span>Edit Problem</span>
                    </a>
                    <button onclick={() => isDeletionModalVisible = true}
                        class="flex items-center gap-2 px-4 py-2 bg-admin-danger-bg text-admin-danger-text text-sm rounded-sm cursor-pointer transition-colors hover:bg-admin-danger-bg-hover">
                        <BinIconSvg options={{ class: "w-4 h-4 stroke-current stroke-2" }}/>
                        <span>Delete</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">Acceptance</span>
                        <ToolTip options={{ tip: "Percentage of \nsubmissions that \npass all test cases" }}/>
                    </div>
                    <div class="text-2xl font-semibold text-[#89d185]">{acceptanceRatePercent}%</div>
                    <div class="text-xs text-admin-text-muted mt-1">
                        {data.attemptMetrics.acceptedAttempts} / {data.attemptMetrics.totalAttempts}
                    </div>
                </div>

                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">Attempts</span>
                    </div>
                    <div class="text-2xl font-semibold text-admin-text-primary">
                        {data.attemptMetrics.totalAttempts}
                    </div>
                    <div class="text-xs text-admin-text-muted mt-1">
                        {data.attemptMetrics.uniqueAttempts} unique users
                    </div>
                </div>

                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">Drop-off</span>
                        <ToolTip options={{ tip: "Users who started \nbut didn't finish" }}/>
                    </div>
                    <div class="text-2xl font-semibold text-[#f14c4c]">{dropOffRate}%</div>
                    <div class="text-xs text-admin-text-muted mt-1">
                        {data.churnMetrics.userStartCount - data.churnMetrics.userFinishCount} users
                    </div>
                </div>

                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">Avg Runtime</span>
                    </div>
                    <div class="text-2xl font-semibold text-admin-accent-primary">
                        {`${(data.performanceMetrics.averageRuntimeNs / 1_000_000).toFixed(2)}ms`}
                    </div>
                    <div class="text-xs text-admin-text-muted mt-1">
                        p95: {`${(data.performanceMetrics.p95RuntimeMs / 1_000_000).toFixed(2)}ms`}
                    </div>
                </div>

                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">Avg Memory</span>
                    </div>
                    <div class="text-2xl font-semibold text-admin-text-primary">
                        {formatMemoryKb(data.performanceMetrics.avgJvmMemoryUsageKb)}
                    </div>
                </div>

                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded p-4">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-xs font-semibold text-admin-text-muted uppercase tracking-wider">Unique Solved</span>
                        <ToolTip options={{ tip: "Unique users who \npassed at \nleast once" }}/>
                    </div>
                    <div class="text-2xl font-semibold text-[#cca700]">
                        {data.attemptMetrics.acceptedUniqueAttempts}
                    </div>
                    <div class="text-xs text-admin-text-muted mt-1">
                        of {data.attemptMetrics.uniqueAttempts} who tried
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                    <div class="flex items-center justify-between h-12 gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                        <div class="flex flex-row gap-2 justify-start grow">
                            <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider"> {currentTab === "Churn" ? "User Funnel" : "Acceptance over time"}</h3>
                            <ToolTip options={{ tip: "Started: opened editor \nSubmitted: ran tests \nFinished: passed all" }}/>    
                        </div>
                        <div class="max-w-32 flex flex-row bg-admin-border-primary p-1 rounded-full">
                            {#each Tabs as tab}
                                <button onclick={() => {
                                    currentTab = tab
                                }} class="px-2 w-full py-1 rounded-full text-[10px] transition-all
                                    {currentTab === tab ? 'bg-admin-accent-primary text-admin-text-secondary font-medium' : 'text-admin-text-muted hover:text-admin-text-secondary'}">
                                    <span>{tab}</span>
                                </button>
                            {/each}
                        </div>
                    </div>
                    {#if currentTab === "Churn"}
                        <div class="p-4 pt-8 h-48">
                            <canvas {@attach node => drawChurnChart(node, data.churnMetrics, chartDefaults, chartColors)}></canvas>
                        </div>
                    {:else}
                        <div class="p-4 h-64">
                            {#if data.timeSeriesMetrics?.acceptanceRateHistory?.length > 0}
                                <canvas {@attach node => drawAcceptanceRatOverTimeChart(node, data.timeSeriesMetrics, chartDefaults, chartColors)} ></canvas>
                            {:else}
                                <div class="flex items-center justify-center h-full text-admin-text-muted text-sm">
                                    No historical data available yet
                                </div>
                            {/if}
                        </div>
                    {/if}
                    </div> 

                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                    <div class="items-center h-12 gap-2.5 px-4 py-2 bg-admin-bg-tertiary border-b border-admin-bg-input flex justify-between">
                        <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">{currentlyPreviewedPerformanceTab} Distribution</h3>
                        <div class="flex flex-row h-full items-center gap-1 bg-admin-border-primary rounded-full p-1">
                            {#each PerformanceTabs as tab}
                                <button onclick={() => {
                                    currentlyPreviewedPerformanceTab = tab
                                }} class="px-2 w-full py-1 rounded-full text-[10px] transition-all
                                    {currentlyPreviewedPerformanceTab === tab ? 'bg-admin-accent-primary text-admin-text-secondary font-medium' : 'text-admin-text-muted hover:text-admin-text-secondary'}">
                                    <span>{tab}</span>
                                </button>
                            {/each}
                        </div>
                    </div>
                    <div class="p-4 h-48 flex items-center justify-center">
                        <div class="p-4 h-48 flex items-center justify-center">
                            {#if data.performanceMetrics?.runtimeBuckets?.length > 0}
                                {#if currentlyPreviewedPerformanceTab === "Runtime"}
                                    <canvas 
                                        {@attach node => drawRuntimeChart(node, data.performanceMetrics, chartColors, chartDefaults)}
                                        class="w-full h-full"
                                    ></canvas>
                                {:else}
                                    <canvas 
                                        {@attach node => drawMemoryChart(node, data.performanceMetrics, chartColors, chartDefaults)}
                                        class="w-full h-full"
                                    ></canvas>
                                {/if}
                            {:else}
                                <span class="text-admin-text-muted text-sm">
                                    No runtime data available yet
                                </span>
                            {/if}
                        </div>
                    </div>
                    <div class="px-4 pb-4">
                        <div class="flex items-center justify-between text-xs text-admin-text-muted border-t border-admin-bg-input pt-3">
                            <span>Median</span>
                            <span class="font-semibold text-admin-text-primary">
                                {`${(data.performanceMetrics.medianRuntimeMs / 1_000_000).toFixed(2)}ms`}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="bg-admin-bg-secondary border border-admin-bg-input h-full rounded overflow-hidden">
                    <div class="flex items-center gap-2.5 h-12 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                        <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Test Case Pass Rates</h3>
                        <ToolTip options={{ tip: "Which test cases are hardest to pass." }}/>
                    </div>
                    <div class="p-4 h-48">
                        {#if data.testCaseStats?.length > 0}
                            <canvas class="w-full h-full" {@attach node => drawTestCaseChart(node, data.testCaseStats, chartDefaults, chartColors)}></canvas>
                        {:else}
                            <div class="flex items-center justify-center h-full text-admin-text-muted text-sm">
                                No test case data available
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <RecentSubmissionsData {data}/>

            <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                    <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Insights</h3>
                </div>
                <SuggestionsArea {data}/>
            </div>
        </div>
    </main>
{/key}