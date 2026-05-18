import axios from "axios";
import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import Sidebar from "@/Components/Sidebar.jsx";
import LogDurationToDifference from "@/Components/LogDurationToDifference.jsx";
import DataExport from "@/Components/DataExport.jsx";
import Feelingsdashboard from "@/Components/Feelingsdashboard.jsx";
import ListOfAllDataPoints from "@/Components/ListOfAllDataPoints.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

const menuItems = [
    { key: "gevoelsmetingen",     label: "Gevoelsmetingen" },
    { key: "logDuration",         label: "Log van de Duur" },
    { key: "listOfAllDatapoints", label: "Alle datapunten" },
    { key: "dataExport",          label: "Exporteer data" },
];

export default function DashboardResearcher({
                                                exerciseNames = [],
                                                userExerciseLogs = [],
                                                researchGroups = [],
                                                exercises = [],
                                            }) {
    const [view, setView] = useState("gevoelsmetingen");
    const [isLoading, setIsLoading] = useState(false);

    // State for LogDurationToDifference
    const [statistics, setStatistics] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState(null);

    // Fetch statistics for a specific exercise
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

    const handleViewChange = (newView) => {
        if (newView === view) return;
        setIsLoading(true);
        setView(newView);
        setTimeout(() => setIsLoading(false), 300);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Onderzoekerscherm
                </h2>
            }
        >
            <div className="flex flex-col md:flex-row">

                <Sidebar
                    menuItems={menuItems}
                    currentView={view}
                    onViewChange={handleViewChange}
                    title="Onderzoekersmenu"
                />

                <main className="flex-1 p-4 md:p-6 overflow-x-auto">
                    {isLoading ? (
                        <LoadingIndicator message="Pagina laden..." />
                    ) : (
                        <>
                            {view === "gevoelsmetingen" && (
                                <div>
                                    <h1 className="text-lg font-bold mb-4">Gevoelsmetingen</h1>
                                    <Feelingsdashboard
                                        researchGroups={researchGroups}
                                        exercises={exercises}
                                    />
                                </div>
                            )}

                            {view === "logDuration" && (
                                <div>
                                    <h1 className="text-lg font-bold mb-4">Log van de Duur</h1>
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
                                    <h1 className="text-lg font-bold mb-4">Alle datapunten bekijken</h1>
                                    <ListOfAllDataPoints
                                        researchGroups={researchGroups}
                                        exercises={exercises}
                                    />
                                </div>
                            )}

                            {view === "dataExport" && (
                                <div>
                                    <h1 className="text-lg font-bold mb-4">Exporteer data</h1>
                                    <DataExport
                                        researchGroups={researchGroups}
                                        exercises={exercises}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
