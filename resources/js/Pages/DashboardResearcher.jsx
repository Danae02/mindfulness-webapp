import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import LogDurationToDifference from "@/Components/LogDurationToDifference.jsx";
import DataExport from "@/Components/DataExport.jsx";
import Feelingsdashboard from "@/Components/Feelingsdashboard.jsx";
import { useState, useEffect } from "react";
import ListOfAllDataPoints from "@/Components/ListOfAllDataPoints.jsx";

export default function DashboardResearcher({
                                                exerciseNames,
                                                userExerciseLogs,
                                                researchGroups = [],
                                                exercises = [],
                                            }) {
    const [view, setView] = useState("gevoelsmetingen");

    useEffect(() => {
        console.log("Current view:", view);
    }, [view]);

    const menuItems = [
        { key: "gevoelsmetingen",     label: "Gevoelsmetingen" },
        { key: "logDuration",         label: "Log van de Duur" },
        { key: "listOfAllDatapoints", label: "Alle datapunten" },
        { key: "dataExport",          label: "Exporteer data" },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Onderzoekerscherm
                </h2>
            }
        >
            <div className="flex flex-col md:flex-row">
                {/* Sidebar */}
                <nav
                    aria-label="Onderzoekersmenu"
                    className="w-full md:w-64 bg-[#312C50] text-white md:min-h-screen"
                >
                    <div className="p-4">
                        <h3 className="text-lg font-semibold break-words">Onderzoekersmenu</h3>
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

                {/* Main content */}
                <main className="flex-1 p-4 md:p-6 overflow-x-auto">
                    {view === "gevoelsmetingen" && (
                        <Feelingsdashboard
                            researchGroups={researchGroups}
                            exercises={exercises}
                        />
                    )}

                    {view === "logDuration" && (
                        <div>
                            <h3 className="text-lg font-bold mb-4 break-words">Log van de Duur</h3>
                            <LogDurationToDifference exerciseNames={exerciseNames} />
                        </div>
                    )}

                    {view === "listOfAllDatapoints" && (
                        <div>
                            <h3 className="text-lg font-bold mb-4 break-words">Alle datapunten bekijken</h3>
                            <ListOfAllDataPoints
                                researchGroups={researchGroups}
                                exercises={exercises}
                            />
                        </div>
                    )}

                    {view === "dataExport" && (
                        <DataExport
                            researchGroups={researchGroups}
                            exercises={exercises}
                        />
                    )}
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
