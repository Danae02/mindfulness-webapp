import { useState } from "react";
import ScatterChart from "@/Components/ScatterChart.jsx";

/**
 *
 * nog mee bezig!! idee claude:
 *
 *
 * Normaliseer een feeling-waarde naar 0–100%.
 * Hiermee zijn waarden van 3-schaal en 5-schaal vergelijkbaar.
 *
 * Formule: (waarde - 1) / (schaal - 1) * 100
 * Voorbeeld: waarde 3 op 5-schaal → 50%
 * Voorbeeld: waarde 2 op 3-schaal → 50%
 */
function normalizeFeeling(value, scale = 5) {
    if (value == null || scale <= 1) return null;
    return Math.round((value - 1) / (scale - 1) * 100);
}

/**
 * Bereken het verschil in stemming na − voor de oefening.
 * Positief = verbetering, negatief = verslechtering.
 * Altijd op 0–100 schaal zodat 3- en 5-schaal logs vergelijkbaar zijn.
 */
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

    const fetchStatistics = async (exerciseName) => {
        setLoading(true);
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
                ) : selectedExercise ? (
                    <>
                        {/* Legenda onder de grafiek */}
                        <ScatterChart data={statistics} />

                        <div className="mt-4 text-sm text-gray-500 space-y-1 border-t pt-3">
                            <p>
                                <strong>Y-as (verschil):</strong> stemming na − stemming voor de oefening,
                                genormaliseerd naar −100 tot +100.
                                Positief = verbetering, negatief = verslechtering.
                            </p>
                            <p>
                                <strong>X-as:</strong> luisterduur in seconden.
                            </p>
                            <p className="text-xs text-gray-400">
                                Waarden zijn genormaliseerd — 3-schaal en 5-schaal logs zijn vergelijkbaar.
                            </p>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-400 italic">
                        Selecteer een oefening om de data te bekijken.
                    </p>
                )}
            </div>
        </div>
    );
}
