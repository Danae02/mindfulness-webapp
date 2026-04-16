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
                <div className="flex flex-col md:flex-row">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-[#312C50] text-white md:min-h-screen">
                        <div className="p-4">
                            <h3 className="text-lg font-semibold break-words">Onderzoekersmenu</h3>
                            <ul className="mt-4 space-y-2">
                                <li>
                                    <button
                                        onClick={() => setView("logDuration")}
                                        className={`w-full text-left p-2 rounded transition-all duration-200 relative ${
                                            view === "logDuration"
                                                ? 'bg-[#9B6DD4] bg-opacity-20 text-white font-medium'
                                                : 'hover:bg-white hover:bg-opacity-10 text-gray-300'
                                        }`}
                                        style={{
                                            ...(view === "logDuration" && {
                                                boxShadow: 'inset 3px 0 0 #9B6DD4'
                                            })
                                        }}
                                    >
                                        <span className="break-words">Log van de Duur</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setView("listOfAllDatapoints")}
                                        className={`w-full text-left p-2 rounded transition-all duration-200 relative ${
                                            view === "listOfAllDatapoints"
                                                ? 'bg-[#9B6DD4] bg-opacity-20 text-white font-medium'
                                                : 'hover:bg-white hover:bg-opacity-10 text-gray-300'
                                        }`}
                                        style={{
                                            ...(view === "listOfAllDatapoints" && {
                                                boxShadow: 'inset 3px 0 0 #9B6DD4'
                                            })
                                        }}
                                    >
                                        <span className="break-words">Lijst van alle opgeslagen datapunten</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 p-4 md:p-6 overflow-x-auto">
                        {view === "logDuration" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4 break-words">Log van de Duur</h3>
                                <LogDurationToDifference exerciseNames={exerciseNames}/>
                            </div>
                        )}
                        {view === "listOfAllDatapoints" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4 break-words">Alle datapunten bekijken</h3>
                                <ListOfAllDataPoints/>
                            </div>
                        )}
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
