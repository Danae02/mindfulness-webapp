import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import {useEffect, useState} from "react";
import {Scatter} from "react-chartjs-2";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);



export default function ScatterChart({data}) {
    const [charData, setCharData] = useState(null);

    useEffect(() => {
        if (data && Array.isArray(data)){
            const mappedData = data.map((stat) => (
                {
                    x: stat.duration_listened,
                    y: stat.feeling_after - stat.feeling_before,
                }
            ))
            setCharData({
                datasets: [
                    {
                        label: 'Feeling Difference vs. Listening Duration',
                        data: mappedData,
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    }
                ]
            })
        }
    }, [data]);

    const options = {
        responsive: true,
        scales: {
            x: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Duration Listened (seconds)',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Feeling Difference (After - Before)',
                },
            },
        },
    };

    return charData ? <Scatter data={charData} options={options} /> : <p>Loading Chart...</p>;

}
