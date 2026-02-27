import { useState, useEffect } from "react";
import axios from "axios";
import RegisterUserAsSupervisor from "@/Components/RegisterUserAsSupervisor.jsx";
import CourseList from "@/Components/CourseList.jsx";
import DashboardViewer from "@/Pages/DashboardViewer.jsx";

export default function TeamList() {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                const response = await axios.get(route('users.get.team'));
                setTeamMembers(response.data); // Verondersteld dat de data een lijst van teamleden is
            } catch (err) {
                console.error("Error fetching team members:", err);
                setError("Er is een probleem opgetreden bij het ophalen van de teamleden.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeamMembers();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500">Teamleden laden...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Mijn Team</h1>
            {teamMembers.length > 0 ? (
                <ul className="space-y-3">
                    {teamMembers.map((member) => (
                        <li
                            key={member.id}
                            className="p-4 bg-white rounded-md shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => handleUserClick(member)}
                        >
                            <div>
                                <p className="text-lg font-medium text-gray-800">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.email}</p>
                            </div>
                            <span className="text-sm text-gray-400">Team ID: {member.team_id}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">Er zijn geen teamleden gevonden.</p>
            )}
            <div className="p-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
                >
                    Gebruiker Toevoegen
                </button>

                {/* Het modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
                            {/* Modal-content */}
                            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                Gebruiker Registreren
                            </h2>

                            {/* RegisterUserAsSupervisor-component */}
                            <RegisterUserAsSupervisor/>

                            {/* Sluitknop in de modal */}
                            <div className="mt-6 flex justify-center">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                                >
                                    Sluiten
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full relative max-h-[80vh] overflow-y-auto">
                        {/* Titel */}
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Oefeningen voor {selectedUser.name}
                        </h2>

                        {/* CourseList */}
                        <CourseList userId={selectedUser.id} />

                        {/* Sluitknop */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="bg-red-500 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
                            >
                                Sluiten
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

