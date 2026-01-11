import { Chart } from "chart.js";
import type { PerformanceMetrics } from "../problemDetailTypes";

export const drawMemoryChart = (canvas: HTMLCanvasElement, data: PerformanceMetrics, chartDefaults: Record<string, any>, chartColors: Record<string, any>) => {
    const runtimeChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.memoryBuckets.map(d => d.range),
            datasets: [{
                label: 'Solutions',
                data: data.memoryBuckets.map(d => d.count),
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