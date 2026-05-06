// ============================================================
// DashboardAdmin.jsx — patch
// Voeg BackupManager toe aan het admin-dashboard
// ============================================================

// STAP 1: Voeg de import toe bovenaan het bestand, bij de andere imports:
//import BackupManager from "@/Components/BackupManager.jsx";

// STAP 2: Voeg de view toe in de JSX, na de bestaande views (bv. na "researchSettings"):
//
//   {view === "backup" && (
//       <div>
//           <h3 className="text-lg font-bold mb-4">Backup & Herstel</h3>
//           <BackupManager />
//       </div>
//   )}
//
// STAP 3: Voeg een knop toe in de Sidebar-component (Sidebar.jsx).
// Zoek de plek waar de andere menu-items staan en voeg dit toe:
//
//   <SidebarItem
//       label="Backup & Herstel"
//       view="backup"
//       icon="💾"          // pas aan naar jouw icon-systeem
//       setView={setView}
//       currentView={currentView}
//   />


// ============================================================
// Hieronder staat de VOLLEDIGE bijgewerkte DashboardAdmin.jsx
// zodat je het als drop-in vervanging kunt gebruiken:
// ============================================================

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
import BackupManager from "@/Components/BackupManager.jsx"; // ← NIEUW

export default function DashboardAdmin() {
    const [view, setView] = useState("courses");
    const [isLoading, setIsLoading] = useState(false);

    const handleViewChange = (newView) => {
        if (newView === view) return;
        setIsLoading(true);
        setView(newView);
        setTimeout(() => setIsLoading(false), 300);
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

                                {/* backup opties */}
                                {view === "backup" && (
                                    <div>
                                        <h3 className="text-lg font-bold mb-4">Backup & Herstel</h3>
                                        <BackupManager />
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
