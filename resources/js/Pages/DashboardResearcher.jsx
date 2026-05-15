import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import LogDurationToDifference from "@/Components/LogDurationToDifference.jsx";
import DataExport from "@/Components/DataExport.jsx";
import Feelingsdashboard from "@/Components/Feelingsdashboard.jsx";
import { useState } from "react";
import ListOfAllDataPoints from "@/Components/ListOfAllDataPoints.jsx";

export default function DashboardResearcher({
                                                exerciseNames,
                                                userExerciseLogs,
                                                researchGroups = [],
                                                exercises = [],
                                            }) {
    const [view, setView] = useState("gevoelsmetingen");

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
                            <LogDurationToDifference exerciseNames={exerciseNames} />
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
