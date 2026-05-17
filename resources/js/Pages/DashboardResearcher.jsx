import axios from "axios";
import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import LogDurationToDifference from "@/Components/LogDurationToDifference.jsx";
import DataExport from "@/Components/DataExport.jsx";
import Feelingsdashboard from "@/Components/Feelingsdashboard.jsx";
import ListOfAllDataPoints from "@/Components/ListOfAllDataPoints.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

export default function DashboardResearcher({
                                                exerciseNames = [],
                                                userExerciseLogs = [],
                                                researchGroups = [],
                                                exercises = [],
                                            }) {
    const [view, setView] = useState("gevoelsmetingen");

    // State for SessionChartData
    const [sessionData, setSessionData] = useState([]);
    const [sessionLoading, setSessionLoading] = useState(false);
    const [sessionError, setSessionError] = useState(null);

    // State for LogDurationToDifference
    const [statistics, setStatistics] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

    // Fetch session data when view changes
    useEffect(() => {
        if (view === "logDuration") {
            const fetchSessionData = async () => {
                setSessionLoading(true);
                setSessionError(null);
                try {
                    const response = await axios.get(route('exercise-logs.get.duration_sessions'));
                    setSessionData(response.data);
                } catch (err) {
                    console.error('Fout bij ophalen sessiedata:', err);
                    setSessionError('Kon sessiedata niet laden');
                }
                finally {
                    setSessionLoading(false);
                }
            };
            fetchSessionData();
        }
    }, [view]);

    // fetch statistics for a specific exercise
    const handleExerciseSelect = async (exerciseName) => {
        setSelectedExercise(exerciseName);
        setStatsLoading(true);
        setStatsError(null);
        try {
            const response = await axios.get(route('exercise-logs.statistics', {
                exercise_name: exerciseName
            }));
            setStatistics(response.data);
        } catch (err) {
            console.error('Fout bij ophalen statistieken:', err);
            setStatsError('Kon statistieken niet laden');
            setStatistics([]);
        } finally {
            setStatsLoading(false);
        }
    };

    const menuItems = [
        { key: "gevoelsmetingen",     label: "Gevoelsmetingen" },
        { key: "logDuration",         label: "Log van de Duur" },
        { key: "listOfAllDatapoints", label: "Alle datapunten" },
        { key: "dataExport",          label: "Exporteer data" },
    ];

    return (
        <AuthenticatedLayout
            header={
                <span className="text-xl font-semibold leading-tight text-gray-800">
                    Onderzoekerscherm
                </span>
            }
        >
            <div className="flex flex-col md:flex-row">

                <nav
                    aria-label="Onderzoekersmenu"
                    className="w-full md:w-64 bg-[#312C50] text-white md:min-h-screen"
                >
                    <div className="p-4">
                        <p className="text-lg font-semibold break-words">
                            Onderzoekersmenu
                        </p>
                        <ul className="mt-4 space-y-2">
                            {menuItems.map(({ key, label }) => (
                                <li key={key}>
                                    <button
                                        onClick={() => setView(key)}
                                        aria-current={view === key ? "page" : undefined}
                                        className={`w-full text-left p-2 rounded transition-all duration-200 ${
                                            view === key
                                                ? "bg-[#9B6DD4] bg-opacity-20 text-white font-medium"
                                                : "hover:bg-white hover:bg-opacity-10 text-gray-300"
                                        }`}
                                        style={view === key ? { boxShadow: "inset 3px 0 0 #9B6DD4" } : {}}
                                    >
                                        <span className="break-words">{label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <main className="flex-1 p-4 md:p-6 overflow-x-auto">

                    <h1 className="text-xl font-semibold leading-tight text-gray-800 mb-4">
                        Onderzoekerscherm
                    </h1>

                    {view === "gevoelsmetingen" && (
                        <Feelingsdashboard
                            researchGroups={researchGroups}
                            exercises={exercises}
                        />
                    )}

                    {view === "logDuration" && (
                        <div>
                            <h2 className="text-lg font-bold mb-4 break-words">
                                Log van de Duur
                            </h2>
                            <LogDurationToDifference
                                exerciseNames={exerciseNames}
                                statistics={statistics}
                                selectedExercise={selectedExercise}
                                loading={statsLoading}
                                error={statsError}
                                onExerciseSelect={handleExerciseSelect}
                            />
                        </div>
                    )}

                    {view === "listOfAllDatapoints" && (
                        <div>
                            <h2 className="text-lg font-bold mb-4 break-words">
                                Alle datapunten bekijken
                            </h2>
                            <ListOfAllDataPoints
                                researchGroups={researchGroups}
                                exercises={exercises}
                            />
                        </div>
                    )}

                    {view === "dataExport" && (
                        <div>
                            <h2 className="text-lg font-bold mb-4 break-words">
                                Exporteer data
                            </h2>
                            <DataExport
                                researchGroups={researchGroups}
                                exercises={exercises}
                            />
                        </div>
                    )}

                </main>
            </div>
        </AuthenticatedLayout>
    );
}
