import { useState } from "react";
import { normalizeFeeling, calculateDifference } from "@/Utils/feelingNormalization.js";
import ScatterChart from "@/Components/ScatterChart.jsx";

export default function LogDurationToDifference({
                                                    exerciseNames = [],
                                                    statistics = [],
                                                    selectedExercise = null,
                                                    loading = false,
                                                    error = null,
                                                    onExerciseSelect = () => {},
                                                }) {
    const [displayStats, setDisplayStats] = useState([]);
    const [displayLoading, setDisplayLoading] = useState(false);

    // When selectedExercise changes, enrich the statistics with normalized values
    if (selectedExercise && statistics.length > 0) {
        const enriched = statistics.map((stat) => ({
            ...stat,
            feeling_before_normalized: normalizeFeeling(stat.feeling_before, stat.feeling_scale ?? 5),
            feeling_after_normalized:  normalizeFeeling(stat.feeling_after,  stat.feeling_scale ?? 5),
            difference: calculateDifference(stat.feeling_before, stat.feeling_after, stat.feeling_scale ?? 5),
        }));

        if (JSON.stringify(enriched) !== JSON.stringify(displayStats)) {
            setDisplayStats(enriched);
        }
    }

    const handleExerciseClick = (exerciseName) => {
        setDisplayLoading(true);
        onExerciseSelect(exerciseName);
        setTimeout(() => setDisplayLoading(false), 300);
    };

    return (
        <div className="flex gap-4">
            {/* Linkerkant: lijst van oefeningen */}
            <div className="w-1/3 p-4 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Oefeningen:</h3>
                {loading ? (
                    <p className="text-gray-500">Laden...</p>
                ) : exerciseNames.length === 0 ? (
                    <p className="text-gray-400 italic">Geen oefeningen beschikbaar</p>
                ) : (
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
                )}
            </div>

            {/* Rechterkant: grafiek */}
            <div className="flex-1 p-4 bg-white rounded-lg shadow-lg">
                {displayLoading ? (
                    <p className="text-gray-500">Laden...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : selectedExercise ? (
                    displayStats.length === 0 ? (
                        <p className="text-gray-400 italic">
                            Geen logs gevonden met zowel een gevoel als een sessieduur voor deze oefening.
                        </p>
                    ) : (
                        <>
                            <ScatterChart data={displayStats} />
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
