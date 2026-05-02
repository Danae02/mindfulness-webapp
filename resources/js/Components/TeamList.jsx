import { useState, useEffect } from "react";
import axios from "axios";
import RegisterUserAsSupervisor from "@/Components/RegisterUserAsSupervisor.jsx";
import CourseList from "@/Components/CourseList.jsx";

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
                setTeamMembers(response.data); // vanuit gaan dat de data een lijst van teamleden is
            } catch (err) {
                console.error("Error fetching team members:", err);
                setError("Er is een probleem opgetreden bij het ophalen van de teamleden.");
            } finally {
                setLoading(false);
            }
        };
        fetchTeamMembers();
    }, []);

    const getInitial = (name) => name?.charAt(0).toUpperCase() ?? '?';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-gray-400 text-sm">Teamleden laden...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-red-400 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">

            {/* Page header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold" style={{ color: '#5B3F8C' }}>
                    Mijn cliënten dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Je kan op dit moment{' '}
                    <span className="font-semibold">{teamMembers.length}</span>{' '}
                    {teamMembers.length === 1 ? 'persoon' : 'mensen'} begeleiden.
                    Klik op een naam om hun voortgang te bekijken of om een oefening
                    voor ze te starten.
                </p>
            </div>

            {/* Card */}
            <div
                className="rounded-2xl p-6"
                style={{
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #D8C8F0',
                    boxShadow: '0 4px 24px 0 rgba(91,63,140,0.07)',
                }}
            >
                <h2 className="text-base font-semibold mb-4" style={{ color: '#3D2A6E' }}>
                    Mijn cliënten
                </h2>

                {teamMembers.length > 0 ? (
                    <ul className="space-y-3">
                        {teamMembers.map((member) => (
                            <li key={member.id}>
                                <button
                                    onClick={() => handleUserClick(member)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150"
                                    style={{
                                        backgroundColor: '#EDE5F8',
                                        border: '1.5px solid #C9B8E8',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E2D5F5'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EDE5F8'}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                                            style={{ backgroundColor: '#7B5EA7' }}
                                        >
                                            {getInitial(member.name)}
                                        </div>
                                        <span className="font-semibold text-sm" style={{ color: '#3D2A6E' }}>
                                            {member.name}
                                        </span>
                                    </div>
                                    <span className="text-sm flex items-center gap-1" style={{ color: '#7B5EA7' }}>
                                        Openen
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400 text-center py-4">
                        Er zijn nog geen cliënten gevonden.
                    </p>
                )}

                {/* Add client button */}
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                    style={{
                        border: '2px dashed #C9B8E8',
                        backgroundColor: 'transparent',
                        color: '#7B5EA7',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0E8FC'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    + Cliënt toevoegen
                </button>
            </div>

            {/* Modal: gebruiker toevoegen */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative">
                        <h2 className="text-lg font-bold mb-4 text-center" style={{ color: '#3D2A6E' }}>
                            Cliënt registreren
                        </h2>
                        <RegisterUserAsSupervisor />
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2 px-6 rounded-lg text-sm font-medium text-white transition"
                                style={{ backgroundColor: '#7B5EA7' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6a4e8e'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7B5EA7'}
                            >
                                Sluiten
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: gebruiker detail */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl relative max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4" style={{ color: '#3D2A6E' }}>
                            Oefeningen voor {selectedUser.name}
                        </h2>
                        <CourseList userId={selectedUser.id} />
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="py-2 px-6 rounded-lg text-sm font-medium text-white transition"
                                style={{ backgroundColor: '#7B5EA7' }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6a4e8e'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7B5EA7'}
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
