import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import CourseUploader from "@/Components/CourseUploader.jsx";
import CourseEditor from "@/Components/CourseEditor.jsx";
import ListOfAllDataPoints from "@/Components/ListOfAllDataPoints.jsx";
import ListOfAllUsers from "@/Components/ListOfAllUsers.jsx";
import ResearchQuestions from "@/Components/ResearchQuestions.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";
import BackupManager from "@/Components/BackupManager.jsx";

const menuItems = [
    { key: "courses",          label: "Alle cursussen" },
    { key: "addCourse",        label: "Cursus toevoegen" },
    { key: "allDatapoints",    label: "Lijst van alle datapunten" },
    { key: "listOfAllUsers",   label: "Lijst van alle gebruikers" },
    { key: "researchSettings", label: "Gevoelsvragen beheren" },
    { key: "backup",           label: "Backup en herstel" },
];

export default function DashboardAdmin() {
    const [view, setView] = useState("courses");
    const [isLoading, setIsLoading] = useState(false);

    const handleViewChange = (newView) => {
        if (newView === view) return;
        setIsLoading(true);
        setView(newView);
        setTimeout(() => setIsLoading(false), 300);
    };

    const currentLabel = menuItems.find((m) => m.key === view)?.label ?? "";

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Adminscherm
                </h2>
            }
        >
            <div className="flex flex-col md:flex-row">

                {/* Sidebar */}
                <nav
                    aria-label="Adminmenu"
                    className="w-full md:w-64 bg-[#312C50] text-white md:min-h-screen"
                >
                    <div className="p-4">
                        <p className="text-lg font-semibold break-words">Admin Menu</p>
                        <ul className="mt-4 space-y-2">
                            {menuItems.map(({ key, label }) => (
                                <li key={key}>
                                    <button
                                        onClick={() => handleViewChange(key)}
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

                {/* Hoofdinhoud */}
                <main className="flex-1 p-4 md:p-6 overflow-x-auto">
                    {isLoading ? (
                        <LoadingIndicator message="Pagina laden..." />
                    ) : (
                        <>
                            {view === "courses" && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h1 className="text-lg font-bold">Alle Cursussen</h1>
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

                            {view === "addCourse" && (
                                <div>
                                    <h1 className="text-lg font-bold mb-4">Nieuwe cursus toevoegen</h1>
                                    <CourseUploader />
                                </div>
                            )}

                            {view === "allDatapoints" && (
                                <div>
                                    <h1 className="text-lg font-bold mb-4">Lijst van alle datapunten</h1>
                                    <ListOfAllDataPoints />
                                </div>
                            )}

                            {view === "listOfAllUsers" && (
                                <div>
                                    <h1 className="text-lg font-bold mb-4">Lijst van alle gebruikers</h1>
                                    <ListOfAllUsers />
                                </div>
                            )}

                            {view === "researchSettings" && (
                                <div>
                                    <h1 className="text-lg font-bold mb-4">Gevoelsvragen beheren</h1>
                                    <ResearchQuestions />
                                </div>
                            )}

                            {view === "backup" && (
                                <div>
                                    <h1 className="text-lg font-bold mb-4">Backup en herstel</h1>
                                    <BackupManager />
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </AuthenticatedLayout>
    );
}
