import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import { Scatter } from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function ScatterChart({ data }) {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if (data && Array.isArray(data)) {
            const mappedData = data.map((stat) => ({
                x: stat.session_duration,   // ← was duration_listened
                y: stat.difference,
            }));
            setChartData({
                datasets: [
                    {
                        label: "Stemmingsverschil vs. luisterduur",
                        data: mappedData,
                        backgroundColor: "rgba(75, 192, 192, 0.5)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    },
                ],
            });
        }
    }, [data]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
        },
        scales: {
            x: {
                type: "linear",
                title: {
                    display: true,
                    text: "Luisterduur (seconden)",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Stemmingsverschil (na − voor)",
                },
            },
        },
    };

    return chartData ? (
        <Scatter
            data={chartData}
            options={options}
            aria-label="Spreidingsdiagram van stemmingsverschil versus luisterduur per oefening"
            role="img"
        />
    ) : (
        <p>Grafiek laden...</p>
    );
}
