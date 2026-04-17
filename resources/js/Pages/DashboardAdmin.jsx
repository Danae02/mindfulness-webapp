import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import Sidebar from "@/Components/Sidebar.jsx";
import CourseUploader from "@/Components/CourseUploader.jsx";
import CourseEditor from "@/Components/CourseEditor.jsx";
import ListOfAllDataPoints from "@/Components/ListOfAllDataPoints.jsx";
import ListOfAllUsers from "@/Components/ListOfAllUsers.jsx";
import ResearchSettings from "@/Components/ResearchSettings.jsx";
import ResearchQuestions from "@/Components/ResearchQuestions.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

export default function DashboardAdmin() {
    const [view, setView] = useState("courses");
    const [isLoading, setIsLoading] = useState(false);

    const handleViewChange = (newView) => {
        if (newView === view) return;

        setIsLoading(true);
        setView(newView);

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    return (
        <>
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Adminscherm
                    </h2>
                }
            >
                <div className="flex">
                    {/* Sidebar */}
                    <Sidebar setView={handleViewChange} currentView={view} />
                    <div className="w-3/4 p-6">
                        {isLoading ? (
                            <LoadingIndicator message="Pagina laden..." />
                        ) : (
                            <>
                                {/* View Alle Cursussen */}
                                {view === "courses" && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-bold">Alle Cursussen</h3>
                                            <button
                                                onClick={() => handleViewChange("addCourse")}
                                                className="px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400 text-white"
                                                style={{ backgroundColor: "#6C4092" }}
                                            >
                                                + Cursus toevoegen
                                            </button>
                                        </div>
                                        <CourseEditor />
                                    </div>
                                )}

                                {/* View Nieuwe Cursus Toevoegen */}
                                {view === "addCourse" && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Nieuwe Cursus Toevoegen</h3>
                                        <CourseUploader />
                                    </div>
                                )}

                                {/* View Lijst van alle datapunten */}
                                {view === "allDatapoints" && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Lijst van alle datapunten</h3>
                                        <ListOfAllDataPoints />
                                    </div>
                                )}

                                {/* Uitgeschakelde view voor Grafieken van de duur */}
                                {/*{view === "logDuration" && (*/}
                                {/*    <div>*/}
                                {/*        <h3 className="text-lg font-bold mb-4">Grafieken van de duur</h3>*/}
                                {/*        <LogDurationToDifference />*/}
                                {/*    </div>*/}
                                {/*)}*/}

                                {/* View Lijst van alle gebruikers */}
                                {view === "listOfAllUsers" && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Lijst van alle gebruikers</h3>
                                        <ListOfAllUsers />
                                    </div>
                                )}

                                {/* View Gevoelsvragen beheren */}
                                {view === "researchSettings" && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Gevoelsvragen beheren</h3>
                                        <ResearchQuestions />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
