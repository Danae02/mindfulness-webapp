import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import Sidebar from "@/Components/Sidebar.jsx";
import CourseUploader from "@/Components/CourseUploader.jsx";
import CourseEditor from "@/Components/CourseEditor.jsx";
import ListOfAllDataPoints from "@/Components/ListOfAllDataPoints.jsx";
import ListOfAllUsers from "@/Components/ListOfAllUsers.jsx";
import ResearchSettings from "@/Components/ResearchSettings.jsx";

export default function DashboardAdmin() {
    const [view, setView] = useState("courses");  // state voor het bijhouden van de huidige view

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
                    <Sidebar setView={setView} />
                    <div className="w-3/4 p-6">
                        {view === "courses" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Alle Cursussen</h3>
                                <CourseEditor />
                            </div>
                        )}
                        {view === "addCourse" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Nieuwe Cursus Toevoegen</h3>
                                <CourseUploader />
                            </div>
                        )}
                        {view === "allDatapoints" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Lijst van alle datapunten</h3>
                                <ListOfAllDataPoints />
                            </div>
                        )}
                        {/*{view === "logDuration" && (*/}
                        {/*    <div>*/}
                        {/*        <h3 className="text-lg font-bold mb-4">Grafieken van de duur</h3>*/}
                        {/*        <LogDurationToDifference />*/}
                        {/*    </div>*/}
                        {/*)}*/}
                        {view === "listOfAllUsers" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Lijst van alle gebruikers</h3>
                                <ListOfAllUsers />
                            </div>
                        )}
                        {view === "researchSettings" && (
                            <div>
                                <h3 className="text-lg font-bold mb-4">Instellingen voor onderzoek</h3>
                                <ResearchSettings />
                            </div>
                        )}
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
