import { useState, useEffect } from "react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import Sidebar from "@/Components/Sidebar.jsx";
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

    // state for ListOfAllUsers
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const [filtered, setFiltered] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch users when view changes to listOfAllUsers
    useEffect(() => {
        if (view === "listOfAllUsers") {
            const fetchUsers = async () => {
                setUsersLoading(true);
                setUsersError(null);
                try {
                    const response = await axios.get(route('users.index'));
                    setUsers(response.data);
                } catch (err) {
                    console.error('Fout bij ophalen gebruikers:', err);
                    setUsersError('Fout bij het ophalen van gebruikers.');
                } finally {
                    setUsersLoading(false);
                }
            };
            fetchUsers();
        }
    }, [view]);

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
                    Adminscherm
                </h2>
            }
        >
            <div className="flex flex-col md:flex-row">

                <Sidebar
                    menuItems={menuItems}
                    currentView={view}
                    onViewChange={handleViewChange}
                    title="Admin Menu"
                />

                {/* Main content */}
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
                                    <ListOfAllUsers
                                        users={users}
                                        loading={usersLoading}
                                        error={usersError}
                                        filtered={filtered}
                                        onFilterChange={setFiltered}
                                        searchTerm={searchTerm}
                                        onSearchChange={setSearchTerm}
                                        onUsersRefresh={() => {
                                            const fetchUsers = async () => {
                                                const response = await axios.get(route('users.index'));
                                                setUsers(response.data);
                                            };
                                            fetchUsers();
                                        }}
                                    />
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
