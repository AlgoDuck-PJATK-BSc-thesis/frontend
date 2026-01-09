import { Chart } from "chart.js";
import type { TimeSeriesMetrics } from "../problemDetailTypes";

export const drawAcceptanceRatOverTimeChart = (canvas: HTMLCanvasElement, timeSeriesMetrics: TimeSeriesMetrics, chartDefaults: Record<string, any>, chartColors: Record<string, any>) => {
    const submissionsChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: timeSeriesMetrics.submissionsOverTime.map(d => d.date),
            datasets: [
                {
                    label: 'Passed',
                    data: timeSeriesMetrics.submissionsOverTime.map(d => d.passed),
                    backgroundColor: chartColors.success,
                    borderRadius: 2
                },
                {
                    label: 'Failed',
                    data: timeSeriesMetrics.submissionsOverTime.map(d => d.count - d.passed),
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