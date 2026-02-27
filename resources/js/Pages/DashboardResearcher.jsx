import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import LogDurationToDifference from "@/Components/LogDurationToDifference.jsx";
import { useState, useEffect } from "react";
import ListOfAllDataPoints from "@/Components/ListOfAllDataPoints.jsx";

export default function DashboardResearcher({
                                                exerciseNames,
                                                userExerciseLogs
                                            }) {

    const [view, setView] = useState("logDuration");

    // Log the current view after it changes
    useEffect(() => {
        console.log("Current view:", view);
    }, [view]); // Only log when `view` changes

    return (
        <>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Onderzoekerscherm
                    </h2>
                }
            >
                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-1/4 bg-gray-800 text-white h-screen p-4">
                        <h3 className="text-lg font-semibold">Onderzoekersmenu</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <button
                                    onClick={() => setView("logDuration")}
                                    className="w-full text-left p-2 hover:bg-gray-700 rounded"
                                >
                                    Log van de Duur
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setView("listOfAllDatapoints")}
                                    className="w-full text-left p-2 hover:bg-gray-700 rounded"
                                >
                                    Lijst van alle opgeslagen datapunten
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Main content */}
                    <div className="w-3/4 p-6">
                        {view === "logDuration" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Log van de Duur</h3>
                                <LogDurationToDifference exerciseNames={exerciseNames}/>
                            </div>
                        )}
                        {view === "listOfAllDatapoints" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Alle datapunten bekijken</h3>
                                <ListOfAllDataPoints/>
                            </div>
                        )}
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
