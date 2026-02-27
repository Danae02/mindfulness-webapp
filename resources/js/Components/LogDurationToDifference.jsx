import {useEffect, useState} from "react";
import ScatterChart from "@/Components/ScatterChart.jsx";


export default function LogDurationToDifference({
                                                    exerciseNames
                                                }) {

    const [filters, setFilters] = useState({
        completed: false,

    });

    const [statistics, setStatistics] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null); // Houdt de geselecteerde oefening bij
    const [loading, setLoading] = useState(false);

    const fetchStatistics = async (exerciseName) => {
        setLoading(true);

        try {
            const res = await fetch(route('exercise-logs.statistics', { exercise_name: exerciseName }  ))
            if (!res.ok) {
                throw new Error('Er is iets mis gegaan met het ophalen van de data.')
            }
            const data = await res.json()
            setStatistics(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleExerciseClick = (exerciseName) => {
        setSelectedExercise(exerciseName);
        fetchStatistics(exerciseName)
    }

    return(
        <>
            <div className="flex">
                {/* Linkerkant (lijst van oefeningen) */}
                <div className="w-1/3 p-4 bg-white rounded-lg shadow-lg mr-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Oefeningen:</h3>
                    <ul className="space-y-2">
                        {exerciseNames.map((exercise, index) => (
                            <li key={index} onClick={() => handleExerciseClick(exercise)}
                                className="cursor-pointer p-2 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                {exercise}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Rechterkant (de data van de geselecteerde oefening) */}
                <div className="flex-1 p-4 bg-white rounded-lg shadow-lg">
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        selectedExercise && (
                            <ScatterChart data={statistics}/>





                            // <>
                            //     <h4 className="text-xl font-semibold mb-4">Statistieken voor: {selectedExercise}</h4>
                            //     <ul className="space-y-2">
                            //         {statistics.map((stat, index) => (
                            //             <li key={index} className="border-b pb-2">
                            //                 <p className="text-sm">Oefening: {stat.exercise_name}</p>
                            //                 <p className="text-sm">Log ID: {stat.log_id}</p>
                            //                 <p className="text-sm">Duration: {stat.duration_listened}</p>
                            //                 <p className="text-sm">Feeling Before: {stat.feeling_before}</p>
                            //                 <p className="text-sm">Feeling After: {stat.feeling_after}</p>
                            //             </li>
                            //         ))}
                            //     </ul>
                            // </>
                        )
                    )}
                </div>
            </div>
        </>
    )

}
