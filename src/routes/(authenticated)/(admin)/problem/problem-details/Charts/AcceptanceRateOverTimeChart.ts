import { Chart } from "chart.js";
import type { TimeSeriesMetrics } from "../problemDetailTypes";

export const drawAcceptanceRatOverTimeChart = (canvas: HTMLCanvasElement, timeSeriesMetrics: TimeSeriesMetrics, chartDefaults: Record<string, any>, chartColors: Record<string, any>) => {
        const acceptanceChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: timeSeriesMetrics.acceptanceRateHistory.map(d => d.date),
                datasets: [{
                    label: 'Acceptance Rate %',
                    data: timeSeriesMetrics.acceptanceRateHistory.map(d => d.rate),
                    borderColor: chartColors.success,
                    backgroundColor: chartColors.successLight,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                ...chartDefaults,
                plugins: {
                    ...chartDefaults.plugins,
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.parsed.y?.toFixed(1)}%`
                        }
                    }
                },
                scales: {
                    ...chartDefaults.scales,
                    y: {
                        ...chartDefaults.scales.y,
                        min: 0,
                        max: 100,
                        ticks: {
                            ...chartDefaults.scales.y.ticks,
                            callback: (value) => `${value}%`
                        }
                    }
                }
            }
        });
        return () => acceptanceChart.destroy();
    }