import { Chart } from "chart.js";
import type { ChurnMetrics } from "../problemDetailTypes";

    export const drawChurnChart = (canvas: HTMLCanvasElement, data: ChurnMetrics, chartDefaults: Record<string, any>, chartColors: Record<string, any>) => {
        const churnChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Started', 'Submitted', 'Finished'],
                datasets: [{
                    data: [
                        data.userStartCount, 
                        data.userSubmitCount, 
                        data.userFinishCount
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