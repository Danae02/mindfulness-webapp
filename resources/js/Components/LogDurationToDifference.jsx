import { useState } from "react";
import ScatterChart from "@/Components/ScatterChart.jsx";

function normalizeFeeling(value, scale = 5) {
    if (value == null || scale <= 1) return null;
    return Math.round((value - 1) / (scale - 1) * 100);
}

function calculateDifference(feelingBefore, feelingAfter, scale = 5) {
    const before = normalizeFeeling(feelingBefore, scale);
    const after  = normalizeFeeling(feelingAfter, scale);
    if (before === null || after === null) return null;
    return after - before;
}

export default function LogDurationToDifference({ exerciseNames }) {
    const [statistics, setStatistics] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStatistics = async (exerciseName) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(route('exercise-logs.statistics', { exercise_name: exerciseName }));
            if (!res.ok) throw new Error('Er is iets mis gegaan met het ophalen van de data.');
            const data = await res.json();

            // Voeg genormaliseerde waarden toe aan elk datapunt
            // feeling_scale wordt meegestuurd vanuit de backend (default 5 voor oude logs)
            const enriched = data.map((stat) => ({
                ...stat,
                feeling_before_normalized: normalizeFeeling(stat.feeling_before, stat.feeling_scale ?? 5),
                feeling_after_normalized:  normalizeFeeling(stat.feeling_after,  stat.feeling_scale ?? 5),
                // 'difference' is wat de ScatterChart op de Y-as zet
                difference: calculateDifference(stat.feeling_before, stat.feeling_after, stat.feeling_scale ?? 5),
            }));

            setStatistics(enriched);
        } catch (e) {
            console.error(e);
            setError('Kon de data niet laden. Probeer het opnieuw.');
        } finally {
            setLoading(false);
        }
    };

    const handleExerciseClick = (exerciseName) => {
        setSelectedExercise(exerciseName);
        fetchStatistics(exerciseName);
    };

    return (
        <div className="flex">
            {/* Linkerkant: lijst van oefeningen */}
            <div className="w-1/3 p-4 bg-white rounded-lg shadow-lg mr-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Oefeningen:</h3>
                <ul className="space-y-2">
                    {exerciseNames.map((exercise, index) => (
                        <li
                            key={index}
                            onClick={() => handleExerciseClick(exercise)}
                            className={`cursor-pointer p-2 rounded-md transition-colors ${
                                selectedExercise === exercise
                                    ? 'bg-purple-100 text-purple-800 font-semibold'
                                    : 'hover:bg-gray-200'
                            }`}
                        >
                            {exercise}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Rechterkant: grafiek */}
            <div className="flex-1 p-4 bg-white rounded-lg shadow-lg">
                {loading ? (
                    <p className="text-gray-500">Laden...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : selectedExercise ? (
                    statistics.length === 0 ? (
                        <p className="text-gray-400 italic">
                            Geen logs gevonden met zowel een gevoel als een sessieduur voor deze oefening.
                        </p>
                    ) : (
                        <>
                            <ScatterChart data={statistics} />
                            <div className="mt-4 text-sm text-gray-600 space-y-1 border-t pt-3">
                                <p>
                                    <strong>Y-as (verschil):</strong> stemming na − stemming voor de oefening,
                                    genormaliseerd naar −100 tot +100.
                                    Positief = verbetering, negatief = verslechtering.
                                </p>
                                <p>
                                    <strong>X-as:</strong> luisterduur in seconden.
                                </p>
                                <p className="text-xs text-gray-600">
                                    Waarden zijn genormaliseerd — 3-schaal en 5-schaal logs zijn vergelijkbaar.
                                </p>
                            </div>
                        </>
                    )
                ) : (
                    <p className="text-gray-400 italic">
                        Selecteer een oefening om de data te bekijken.
                    </p>
                )}
            </div>
        </div>
    );
}
