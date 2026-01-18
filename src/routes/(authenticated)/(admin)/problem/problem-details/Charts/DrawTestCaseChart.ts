import { Chart } from "chart.js";
import type { TestCaseStats } from "../problemDetailTypes";

    export const drawTestCaseChart = (canvas: HTMLCanvasElement, data: TestCaseStats[], chartDefaults: Record<string, any>, chartColors: Record<string, any>) => {
        const testCaseChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: data.map((tc, i) => `TC ${i + 1}`),
                datasets: [{
                    label: 'Pass Rate %',
                    data: data.map(tc => tc.passRate * 100),
                    backgroundColor: data.map(tc => {
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