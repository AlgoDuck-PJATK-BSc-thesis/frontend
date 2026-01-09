<script lang="ts">
    import { Chart, registerables } from 'chart.js';
    import ChevronIconSvgNew from "$lib/svg/EditorComponentIcons/ChevronIconSvgNew.svelte";
    import BinIconSvg from "$lib/svg/EditorComponentIcons/BinIconSvg.svelte";
    import TickIconSvg from "$lib/svg/EditorComponentIcons/TickIconSvg.svelte";
    import ErrorIconSvg from "$lib/svg/Toast/ErrorIconSvg.svelte";
	import { PerformanceTabs, type PerformanceTab, type ProblemStatsDto } from "./problemDetailTypes";
	import WarningIconSvg from '$lib/svg/Toast/WarningIconSvg.svelte';
	import PenIconSvg from '$lib/svg/EditorComponentIcons/PenIconSvg.svelte';
	import CrossIconSvg from '$lib/svg/CrossIconSvg.svelte';
	import { adminThemes } from '$lib/Themes/AdminThemes';
	import { CurrentAdminTheme } from '$lib/Themes/AdminThemes/currentAdminTheme.svelte';
	import DeletionModal from './DeletionModal.svelte';
	import ToolTip from '../upsert/ToolTip.svelte';
	import { drawAcceptanceRatOverTimeChart } from './Charts/AcceptanceRateOverTimeChart';

    Chart.register(...registerables);

    let { data }: { data: ProblemStatsDto } = $props();


    const rgbToHex = (rgb: string): string => {
        const [r, g, b] = rgb.split(' ').map(Number);
        return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    };

    const rgbToRgba = (rgb: string, alpha: number): string => {
        const [r, g, b] = rgb.split(' ').map(Number);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

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

    const nsToMs = (ns: number): number => ns / 1_000_000;
    const kbToMb = (kb: number): number => kb / 1024;

    const formatRuntimeNs = (ns: number): string => {
        const ms = nsToMs(ns);
        if (ms < 1) return `${(ns / 1000_000).toFixed(0)}μs`;
        if (ms < 1000) return `${ms.toFixed(1)}ms`;
        return `${(ms / 1000_000).toFixed(2)}s`;
    };

    const formatMemoryKb = (kb: number): string => {
        if (kb < 1024) return `${kb.toFixed(0)} KB`;
        return `${kbToMb(kb).toFixed(1)} MB`;
    };

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

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString();
    };


    const drawChurnChart = (canvas: HTMLCanvasElement) => {
        const churnChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Started', 'Submitted', 'Finished'],
                datasets: [{
                    data: [
                        data.churnMetrics.userStartCount, 
                        data.churnMetrics.userSubmitCount, 
                        data.churnMetrics.userFinishCount
                    ],
                    backgroundColor: [chartColors.muted, chartColors.warning, chartColors.success],
                    borderRadius: 4
                }]
            },
            options: {
                ...chartDefaults,
                indexAxis: 'y',
                plugins: {
                    ...chartDefaults.plugins,
                    legend: { display: false }
                }
            }
        });
        return () => churnChart.destroy();
    }

    const drawRuntimeChart = (canvas: HTMLCanvasElement) => {
        const runtimeChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.performanceMetrics.runtimeBuckets.map(d => d.range),
                datasets: [{
                    label: 'Solutions',
                    data: data.performanceMetrics.runtimeBuckets.map(d => d.count),
                    backgroundColor: chartColors.primary,
                    borderRadius: 2
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: { display: false }
                }
            }
        });
        return () => runtimeChart.destroy();
    }

    const drawTestCaseChart = (canvas: HTMLCanvasElement) => {
        const testCaseChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.testCaseStats.map((tc, i) => `TC ${i + 1}`),
                datasets: [{
                    label: 'Pass Rate %',
                    data: data.testCaseStats.map(tc => tc.passRate * 100),
                    backgroundColor: data.testCaseStats.map(tc => {
                        const rate = tc.passRate * 100;
                        return rate >= 80 ? chartColors.success :
                                rate >= 50 ? chartColors.warning : chartColors.danger;
                    }),
                    borderRadius: 2
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y?.toFixed(1)}% pass rate`
                        }
                    }
                },
                scales: {
                    ...chartDefaults.scales,
                    y: {
                        ...chartDefaults.scales.y,
                        min: 0,
                        max: 100
                    }
                }
            }
        });
        return () => testCaseChart.destroy()
    }

    const drawSubmissionChart = (canvas: HTMLCanvasElement) => {
        const submissionsChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.timeSeriesMetrics.submissionsOverTime.map(d => d.date),
                datasets: [
                    {
                        label: 'Passed',
                        data: data.timeSeriesMetrics.submissionsOverTime.map(d => d.passed),
                        backgroundColor: chartColors.success,
                        borderRadius: 2
                    },
                    {
                        label: 'Failed',
                        data: data.timeSeriesMetrics.submissionsOverTime.map(d => d.count - d.passed),
                        backgroundColor: chartColors.danger,
                        borderRadius: 2
                    }
                ]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    legend: { 
                        ...chartDefaults.plugins.legend,
                        position: 'bottom' 
                    }
                },
                scales: {
                    ...chartDefaults.scales,
                    x: { ...chartDefaults.scales.x, stacked: true },
                    y: { ...chartDefaults.scales.y, stacked: true }
                }
            }
        });
        return () => submissionsChart.destroy();
    }

    const dropOffRate = $derived(
        data.churnMetrics.userStartCount > 0 
            ? ((data.churnMetrics.userStartCount - data.churnMetrics.userFinishCount) / data.churnMetrics.userStartCount * 100).toFixed(1)
            : '0'
    );

    const completionRate = $derived(
        data.churnMetrics.userStartCount > 0 
            ? (data.churnMetrics.userFinishCount / data.churnMetrics.userStartCount * 100).toFixed(1)
            : '0'
    );

    const acceptanceRatePercent = $derived((data.attemptMetrics.acceptanceRate * 100).toFixed(1));

    const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
        'Accepted': { color: 'text-[#89d185]', bg: 'bg-[#89d185]/15', label: 'Passed' },
        'Success': { color: 'text-[#89d185]', bg: 'bg-[#89d185]/15', label: 'Passed' },
        'WrongAnswer': { color: 'text-[#f14c4c]', bg: 'bg-[#f14c4c]/15', label: 'Wrong Answer' },
        'RuntimeError': { color: 'text-[#cca700]', bg: 'bg-[#cca700]/15', label: 'Runtime Error' },
        'CompilationError': { color: 'text-[#cca700]', bg: 'bg-[#cca700]/15', label: 'Compile Error' },
        'TimeLimitExceeded': { color: 'text-[#858585]', bg: 'bg-[#858585]/15', label: 'TLE' },
        'MemoryLimitExceeded': { color: 'text-[#858585]', bg: 'bg-[#858585]/15', label: 'MLE' },
    };

    const getStatusConfig = (status: string) => {
        return statusConfig[status] ?? { color: 'text-[#858585]', bg: 'bg-[#858585]/15', label: status };
    };

    const hasTimeSeriesData = $derived(
        data.timeSeriesMetrics?.acceptanceRateHistory?.length > 0 || 
        data.timeSeriesMetrics?.submissionsOverTime?.length > 0
    );

    let currentlyPreviewedPerformanceTab: PerformanceTab = $state("Runtime")
    let isDeletionModalVisible: boolean = $state(false);
</script>

{#if isDeletionModalVisible}
    <DeletionModal bind:isVisible={isDeletionModalVisible} problemId={data.problemDetailsCore.problemId}/>
{/if}
{#key CurrentAdminTheme.theme}
    <main class="w-full min-h-screen bg-admin-bg-primary text-admin-text-muted font-sans">
        <div class="max-w-7xl mx-auto p-6 flex flex-col gap-6">
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
                        {formatRuntimeNs(data.performanceMetrics.averageRuntimeNs)}
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

            {#if hasTimeSeriesData}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                        <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                            <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Acceptance Rate Trend</h3>
                            <ToolTip options={{ tip: "How acceptance rate has changed over time" }}/>
                        </div>
                        <div class="p-4 h-64">
                            {#if data.timeSeriesMetrics?.acceptanceRateHistory?.length > 0}
                                <canvas {@attach node => drawAcceptanceRatOverTimeChart(node, data.timeSeriesMetrics, chartDefaults, chartColors)} ></canvas>
                            {:else}
                                <div class="flex items-center justify-center h-full text-admin-text-muted text-sm">
                                    No historical data available yet
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                        <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                            <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Submissions Over Time</h3>
                        </div>
                        <div class="p-4 h-64">
                            {#if data.timeSeriesMetrics?.submissionsOverTime?.length > 0}
                                <canvas {@attach node => drawSubmissionChart(node)}></canvas>
                            {:else}
                                <div class="flex items-center justify-center h-full text-admin-text-muted text-sm">
                                    No submission data available yet
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                    <div class="flex items-center h-12 gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                        <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">User Funnel</h3>
                        <ToolTip options={{ tip: "Started: opened editor \nSubmitted: ran tests \nFinished: passed all" }}/>
                    </div>
                    <div class="p-4 h-48">
                        <canvas {@attach node => drawChurnChart(node)}></canvas>
                    </div>
                    <div class="px-4 pb-4">
                        <div class="flex items-center justify-between text-xs text-admin-text-muted border-t border-admin-bg-input pt-3">
                            <span>Completion Rate</span>
                            <span class="font-semibold text-[#89d185]">{completionRate}%</span>
                        </div>
                    </div>
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
                    <div class="p-4 h-48">
                        {#if data.performanceMetrics?.runtimeBuckets?.length > 0}
                            <canvas {@attach node => drawRuntimeChart(node)}></canvas>
                        {:else}
                            <div class="flex items-center justify-center h-full text-admin-text-muted text-sm">
                                No runtime data available yet
                            </div>
                        {/if}
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
                            <canvas class="w-full h-full" {@attach node => drawTestCaseChart(node)}></canvas>
                        {:else}
                            <div class="flex items-center justify-center h-full text-admin-text-muted text-sm">
                                No test case data available
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                <div class="flex items-center justify-between px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                    <div class="flex items-center gap-2.5">
                        <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Recent Submissions</h3>
                        <span class="text-[10px] font-semibold text-[#858585] bg-[#37373d] px-1.5 py-0.5 rounded-full">
                            {data.recentSubmission?.length ?? 0}
                        </span>
                    </div>
                    <a href="/problems/{data.problemDetailsCore.problemId}/submissions" class="text-xs text-admin-accent-primary hover:underline">
                        View all →
                    </a>
                </div>
                <div class="overflow-x-auto">
                    {#if data.recentSubmission?.length > 0}
                        <table class="w-full">
                            <thead>
                                <tr class="border-b border-admin-bg-input text-xs text-admin-text-muted uppercase tracking-wider">
                                    <th class="text-left px-4 py-2 font-semibold">Status</th>
                                    <th class="text-left px-4 py-2 font-semibold">User</th>
                                    <th class="text-left px-4 py-2 font-semibold">Runtime</th>
                                    <th class="text-left px-4 py-2 font-semibold">Submitted</th>
                                    <th class="text-right px-4 py-2 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each data.recentSubmission as submission}
                                    {@const config = getStatusConfig(submission.status)}
                                    <tr class="border-b border-admin-bg-input last:border-b-0 hover:bg-[#2a2d2e] transition-colors">
                                        <td class="px-4 py-3">
                                            <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded {config.color} {config.bg}">
                                                {#if submission.status === 'Accepted' || submission.status === 'Success'}
                                                    <TickIconSvg options={{ class: "w-5 h-5 stroke-current stroke-2" }}/>
                                                {:else}
                                                    <ErrorIconSvg options={{ class: "w-5 h-5 stroke-current stroke-2" }}/>
                                                {/if}
                                                <span>{config.label}</span>
                                            </span>
                                        </td>
                                        <td class="px-4 py-3">
                                            <a href="/users/{submission.userId}" class="text-sm text-admin-accent-primary hover:underline">
                                                {submission.username}
                                            </a>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-admin-text-secondary font-mono">
                                            {formatRuntimeNs(submission.runtimeNs)}
                                        </td>
                                        <td class="px-4 py-3 text-sm text-admin-text-muted">
                                            {formatTimeAgo(submission.submittedAt)}
                                        </td>
                                        <td class="px-4 py-3 text-right">
                                            <a href="/submissions/{submission.submissionId}" 
                                                class="text-xs text-admin-text-muted hover:text-admin-accent-primary transition-colors">
                                                View Code →
                                            </a>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    {:else}
                        <div class="flex flex-col items-center justify-center py-12 text-admin-text-muted">
                            <span class="text-sm">No submissions yet</span>
                        </div>
                    {/if}
                </div>
            </div>

            <div class="bg-admin-bg-secondary border border-admin-bg-input rounded overflow-hidden">
                <div class="flex items-center gap-2.5 px-4 py-3 bg-admin-bg-tertiary border-b border-admin-bg-input">
                    <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Insights</h3>
                </div>
                <div class="p-4 flex flex-col gap-3">
                    {#if data.attemptMetrics.acceptanceRate < 0.20}
                        <div class="flex items-start gap-3 p-3 bg-[#f14c4c]/10 border-l-4 border-[#f14c4c] rounded-r">
                            <ErrorIconSvg options={{ class: "w-5 h-5 stroke-[#f14c4c] stroke-2 flex-shrink-0 mt-0.5" }}/>
                            <div>
                                <span class="text-sm font-medium text-[#f14c4c]">Low Acceptance Rate</span>
                                <p class="text-xs text-admin-text-muted mt-1">
                                    Only {acceptanceRatePercent}% of submissions pass. Consider reviewing problem difficulty or providing additional hints.
                                </p>
                            </div>
                        </div>
                    {/if}

                    {#if Number(dropOffRate) > 70}
                        <div class="flex items-start gap-3 p-3 bg-[#cca700]/10 border-l-4 border-[#cca700] rounded-r">
                            <ErrorIconSvg options={{ class: "w-5 h-5 stroke-[#cca700] stroke-2 flex-shrink-0 mt-0.5" }}/>
                            <div>
                                <span class="text-sm font-medium text-[#cca700]">High Drop-off Rate</span>
                                <p class="text-xs text-admin-text-muted mt-1">
                                    {dropOffRate}% of users who started didn't finish. The problem may be too difficult or unclear.
                                </p>
                            </div>
                        </div>
                    {/if}

                    {#if data.testCaseStats?.some(tc => tc.passRate < 0.30)}
                        {@const hardestTC = data.testCaseStats.reduce((min, tc) => tc.passRate < min.passRate ? tc : min)}
                        {@const hardestTCIndex = data.testCaseStats.findIndex(tc => tc.testCaseId === hardestTC.testCaseId)}
                        <div class="flex items-start gap-3 p-3 bg-admin-accent-primary/10 border-l-4 border-admin-accent-primary rounded-r">
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
                        <div class="flex items-start gap-3 p-3 bg-[#f14c4c]/10 border-l-4 border-[#f14c4c] rounded-r">
                            <ErrorIconSvg options={{ class: "w-5 h-5 stroke-[#f14c4c] stroke-2 flex-shrink-0 mt-0.5" }}/>
                            <div>
                                <span class="text-sm font-medium text-[#f14c4c]">No Successful Completions</span>
                                <p class="text-xs text-admin-text-muted mt-1">
                                    {data.churnMetrics.userSubmitCount} users have submitted but none have passed. 
                                    Check if test cases are correct or if the problem is solvable.
                                </p>
                            </div>
                        </div>
                    {/if}

                    {#if data.attemptMetrics.acceptanceRate >= 0.20 && Number(dropOffRate) <= 70 && !data.testCaseStats?.some(tc => tc.passRate < 0.30)}
                        <div class="flex items-start gap-3 p-3 bg-[#89d185]/10 border-l-4 border-[#89d185] rounded-r">
                            <TickIconSvg options={{ class: "w-5 h-5 stroke-[#89d185] stroke-2 flex-shrink-0 mt-0.5" }}/>
                            <div>
                                <span class="text-sm font-medium text-[#89d185]">Healthy Metrics</span>
                                <p class="text-xs text-admin-text-muted mt-1">
                                    This problem has balanced difficulty with good engagement. No immediate action needed.
                                </p>
                            </div>
                        </div>
                    {/if}

                    {#if data.attemptMetrics.totalAttempts === 0}
                        <div class="flex items-start gap-3 p-3 bg-[#858585]/10 border-l-4 border-[#858585] rounded-r">
                            <WarningIconSvg options={{class:'h-5 w-5 stroke-admin-text-muted stroke-[2]'}}/>
                            <div>
                                <span class="text-sm font-medium text-[#858585]">No Data Yet</span>
                                <p class="text-xs text-admin-text-muted mt-1">
                                    This problem hasn't received any submissions yet. Insights will appear once users start attempting it.
                                </p>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </main>
{/key}