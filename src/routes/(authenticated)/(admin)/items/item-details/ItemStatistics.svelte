<script lang="ts">
    import type { 
        ItemPurchaseTimeseriesData, 
        ItemSpecificStatistics, 
        ItemType,
        DuckOwnershipStatistics,
        PlantOwnershipStatistics 
    } from "./ItemDetailsTypes";
    import Chart from "chart.js/auto";
	import Account from "$lib/svg/account.svelte";
	import HomeIconSvg from "$lib/svg/EditorComponentIcons/HomeIconSvg.svelte";
	import SuccessIconSvg from "$lib/svg/Toast/SuccessIconSvg.svelte";
	import CodeObjectIconSvg from "$lib/svg/EditorComponentIcons/CodeObjectIconSvg.svelte";
	import RoseIconSvg from "$lib/svg/EditorComponentIcons/RoseIconSvg.svelte";
	import { GroupIcon } from "lucide-svelte";
	import GroupIconSvg from "$lib/svg/EditorComponentIcons/GroupIconSvg.svelte";

    let { 
        itemId, 
        itemType, 
        itemSpecificStatistics, 
        timeseriesData 
    }: { 
        itemId: string; 
        itemType: ItemType; 
        itemSpecificStatistics: ItemSpecificStatistics;
        timeseriesData: ItemPurchaseTimeseriesData;
    } = $props();

    $inspect(timeseriesData)
    $inspect(itemSpecificStatistics)

    const getGranularityLabel = (granularity: string): string => {
        switch (granularity) {
            case 'day': return 'Daily';
            case 'month': return 'Monthly';
            default: return granularity;
        }
    };

</script>

<div class="bg-admin-bg-secondary border border-admin-border-primary rounded-xl overflow-hidden">
    <div class="px-4 py-3 bg-admin-bg-tertiary border-b border-admin-border-primary flex items-center justify-between">
        <h3 class="text-xs font-semibold text-admin-text-primary uppercase tracking-wider">Statistics & Analytics</h3>
        <span class="text-[10px] text-admin-text-muted">{getGranularityLabel(timeseriesData.granularity)} data</span>
    </div>

    <div class="p-5">
        <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-admin-bg-primary border border-admin-border-primary rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-[10px] uppercase tracking-wider text-admin-text-muted">Ownership Rate</span>
                    <div class="w-8 h-8 rounded-lg bg-[#4fc1ff]/10 flex items-center justify-center">
                        <GroupIconSvg options={{ class: "w-4 h-4 stroke-[#4fc1ff] stroke-[2]" }}/>
                    </div>
                </div>
                <div class="text-2xl font-semibold text-admin-text-primary tabular-nums">{(itemSpecificStatistics.ownedByPercentageOfPopulation * 100).toFixed(1)}%</div>
                <div class="text-xs text-admin-text-muted mt-1">{itemSpecificStatistics.ownedCount?.toLocaleString()} owners</div>
                <div class="mt-3 h-1.5 bg-admin-border-primary rounded-full overflow-hidden">
                    <div class="h-full bg-[#4fc1ff] rounded-full transition-all duration-500"
                        style="width: {Math.min(100, (itemSpecificStatistics.ownedByPercentageOfPopulation * 100))}%">
                    </div>
                </div>
            </div>

            <div class="bg-admin-bg-primary border border-admin-border-primary rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-[10px] uppercase tracking-wider text-admin-text-muted">Active Usage</span>
                    <div class="w-8 h-8 rounded-lg bg-[#89d185]/10 flex items-center justify-center">
                        <SuccessIconSvg options={{ class: 'w-4 h-4 stroke-[2] stroke-[#89d185]'}}/>
                    </div>
                </div>
                <div class="text-2xl font-semibold text-admin-text-primary tabular-nums">{(itemSpecificStatistics.usedByPercentageOfPopulation * 100).toFixed(1)}%</div>
                <div class="text-xs text-admin-text-muted mt-1">{itemSpecificStatistics.usedByCount} actively using</div>
                <div class="mt-3 h-1.5 bg-admin-border-primary rounded-full overflow-hidden">
                    <div class="h-full bg-[#89d185] rounded-full transition-all duration-500"
                        style="width: {Math.min(100, itemSpecificStatistics.usedByPercentageOfPopulation * 100)}%">
                    </div>
                </div>
            </div>

            {#if itemType === 'Duck'}
                {@const DuckStats = itemSpecificStatistics as DuckOwnershipStatistics}
                <div class="bg-admin-bg-primary border border-admin-border-primary rounded-xl p-4">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[10px] uppercase tracking-wider text-admin-text-muted">Avatar Usage</span>
                        <div class="w-8 h-8 rounded-lg bg-[#dcdcaa]/10 flex items-center justify-center">
                            <Account args={{ class: 'w-4 h-4 stroke-[#dcdcaa] stroke-[2]'}}/>
                        </div>
                    </div>
                    <div class="text-2xl font-semibold text-admin-text-primary tabular-nums">{DuckStats.usedAsAvatarPercentageOfPopulation.toFixed(1)}%</div>
                    <div class="text-xs text-admin-text-muted mt-1">{DuckStats.usedAsAvatar} as profile avatar</div>
                    <div class="mt-3 h-1.5 bg-admin-border-primary rounded-full overflow-hidden">
                        <div class="h-full bg-[#dcdcaa] rounded-full" style="width: {Math.min(100, DuckStats.usedAsAvatarPercentageOfPopulation)}%"></div>
                    </div>
                </div>

                <div class="bg-admin-bg-primary border border-admin-border-primary rounded-xl p-4">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[10px] uppercase tracking-wider text-admin-text-muted">Pond Usage</span>
                        <div class="w-8 h-8 rounded-lg bg-[#c586c0]/10 flex items-center justify-center">
                            <HomeIconSvg options={{ class: 'w-4 h-4 stroke-[#c586c0] stroke-[2]' }}/>
                        </div>
                    </div>
                    <div class="text-2xl font-semibold text-admin-text-primary tabular-nums">{(DuckStats.usedForPondPercentageOfPopulation * 100).toFixed(1)}%</div>
                    <div class="text-xs text-admin-text-muted mt-1">{DuckStats.usedForPond} in personal pond</div>
                    <div class="mt-3 h-1.5 bg-admin-border-primary rounded-full overflow-hidden">
                        <div class="h-full bg-[#c586c0] rounded-full" style="width: {DuckStats.usedForPondPercentageOfPopulation * 100}%"></div>
                    </div>
                </div>
            {:else}
                {@const PlantStats = itemSpecificStatistics as PlantOwnershipStatistics}
                <div class="bg-admin-bg-primary border border-admin-border-primary rounded-xl p-4">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[10px] uppercase tracking-wider text-admin-text-muted">Placed in Garden</span>
                        <div class="w-8 h-8 rounded-lg bg-[#89d185]/10 flex items-center justify-center">
                            <RoseIconSvg options={{ class:'w-4 h-4 stroke-admin-success stroke-[2]'}}/>
                        </div>
                    </div>
                    <div class="text-2xl font-semibold text-admin-text-primary tabular-nums">{(PlantStats.usedForPondPercentageOfPopulation * 100).toFixed(1)}%</div>
                    <div class="text-xs text-admin-text-muted mt-1">{PlantStats.usedForPond} placed in gardens</div>
                    <div class="mt-3 h-1.5 bg-admin-border-primary rounded-full overflow-hidden">
                        <div class="h-full bg-[#89d185] rounded-full" style="width: {PlantStats.usedForPondPercentageOfPopulation * 100}%"></div>
                    </div>
                </div>

                <div class="bg-admin-bg-primary border border-admin-border-primary rounded-xl p-4">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-[10px] uppercase tracking-wider text-admin-text-muted">Inventory Only</span>
                        <div class="w-8 h-8 rounded-lg bg-admin-text-muted/10 flex items-center justify-center">
                            <CodeObjectIconSvg options={{ class: 'w-4 h-4 stroke-admin-text-muted stroke-[2]' }}/>
                        </div>
                    </div>
                    <div class="text-2xl font-semibold text-admin-text-primary tabular-nums">{100 - (PlantStats.usedByPercentageOfPopulation * 100)}%</div>
                    <div class="mt-3 h-1.5 bg-admin-border-primary rounded-full overflow-hidden">
                        <div class="h-full bg-admin-text-muted rounded-full" style="width: {Math.min(100, PlantStats.usedByPercentageOfPopulation * 100)}%"></div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="grid grid-cols-[1fr_280px] gap-5">
            <div class="bg-admin-bg-primary border border-admin-border-primary rounded-xl p-4">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-xs font-medium text-admin-text-primary">Purchase Trend</span>
                    <div class="flex items-center gap-1.5">
                        <div class="w-2 h-2 rounded-full bg-[#4fc1ff]"></div>
                        <span class="text-[10px] text-admin-text-muted">{getGranularityLabel(timeseriesData.granularity)} purchases</span>
                    </div>
                </div>
                <div class="h-[180px]">
                    <canvas {@attach node => {
                        const trendChart = new Chart(node, {
                                    type: 'line',
                                    data: {
                                        labels: timeseriesData.buckets.map(b => b.label),
                                        datasets: [{
                                            label: 'Purchases',
                                            data: timeseriesData.buckets.map(b => b.value) ,
                                            borderColor: '#4fc1ff',
                                            backgroundColor: 'rgba(79, 193, 255, 0.1)',
                                            borderWidth: 2,
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 0,
                                            pointHoverRadius: 6,
                                            pointHoverBackgroundColor: '#4fc1ff',
                                            pointHoverBorderColor: '#fff',
                                            pointHoverBorderWidth: 2
                                        }]
                                    },
                                    options: {
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                                                titleColor: '#fff',
                                                bodyColor: '#a0a0a0',
                                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                                borderWidth: 1,
                                                padding: 12,
                                                cornerRadius: 8,
                                            }
                                        },
                                        scales: {
                                            x: {
                                                grid: { display: false },
                                                ticks: { 
                                                    color: 'rgba(255, 255, 255, 0.4)',
                                                    font: { size: 10 },
                                                    maxRotation: 45,
                                                    minRotation: 0
                                                },
                                                border: { display: false }
                                            },
                                            y: {
                                                grid: { 
                                                    color: 'rgba(255, 255, 255, 0.05)',
                                                },
                                            }
                                        },
                                        interaction: {
                                            intersect: false,
                                            mode: 'nearest'
                                        }
                                    }
                                });
                                return () => trendChart.destroy();
                    }} ></canvas>
                </div>
            </div>

            <div class="bg-admin-bg-primary border border-admin-border-primary rounded-xl p-4">
                <div class="mb-4">
                    <span class="text-xs font-medium text-admin-text-primary">Ownership distribution</span>
                    <p class="text-[10px] text-admin-text-muted mt-0.5">Owned by percentage of population</p>
                </div>
                <div class="h-[120px] flex items-center justify-center">
                    <canvas {@attach node => {
                      const distributionChart = new Chart(node, {
                            type: 'doughnut',
                            data: {
                                labels: ["not-owned", "owned"],
                                datasets: [{
                                    data: [itemSpecificStatistics.ownedByPercentageOfPopulation, 1 - itemSpecificStatistics.ownedByPercentageOfPopulation],
                                    backgroundColor: [
                                        'rgba(34, 197, 94, 0.8)',
                                        'rgba(156, 163, 175, 0.8)',
                                    ],
                                    borderColor: 'transparent',
                                    borderWidth: 0,
                                    hoverOffset: 4
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                cutout: '65%',
                                plugins: {
                                    legend: { display: true },
                                    tooltip: {
                                        backgroundColor: 'rgba(30, 30, 30, 0.95)',
                                        titleColor: '#fff',
                                        bodyColor: '#a0a0a0',
                                        borderColor: 'rgba(255, 255, 255, 0.1)',
                                        borderWidth: 1,
                                        padding: 12,
                                        cornerRadius: 8,
                                        callbacks: {
                                            label: (context) => `${context.parsed}% of items`
                                        }
                                    }
                                }
                            }
                        })       
                        return () => distributionChart.destroy();      
                    }}></canvas>
                </div>
            </div>
        </div>
    </div>
</div>