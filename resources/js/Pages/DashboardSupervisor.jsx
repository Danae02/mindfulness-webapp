import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head } from "@inertiajs/react";
import AccessibilityButton from "@/Components/AccessibilityButton";
import TeamList from "@/Components/TeamList";
import ClientDetail from "@/Components/ClientDetail";
import MindfulnessIntroModal from "@/Components/MindfulnessIntroModal";
import MindfulnessInfoBlock from "@/Components/MindfulnessInfoBlock";

export default function DashboardSupervisor() {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showIntroModal, setShowIntroModal] = useState(false);

    // Show modal only on first visit
    useEffect(() => {
        const seen = localStorage.getItem('mindfulness-intro-seen');
        if (!seen) {
            setShowIntroModal(true);
        }
    }, []);

    // Fetch clients data once on mount
    useEffect(() => {
        const fetchClients = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(route('users.get.team'));
                setClients(response.data);
            } catch (err) {
                console.error('Fout bij ophalen cliënten:', err);
                setError('Kon cliënten niet laden');
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, []);

    // Refresh clients after adding new one
    const handleAddSuccess = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('users.get.team'));
            setClients(response.data);
        } catch (err) {
            console.error('Fout bij refresh:', err);
            setError('Kon cliënten niet refreshen');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setTimeout(() => {
            document.getElementById('client-detail-section')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    return (
        <AuthenticatedLayout
            topBar={
                <div
                    className="w-full py-3 border-t-2 border-b-2"
                    style={{ backgroundColor: '#F0E8FF', borderTopColor: '#000000', borderBottomColor: '#000000' }}
                >
                    <div className="flex justify-end px-4 sm:px-6 lg:px-8">
                        <AccessibilityButton variant="plain" />
                    </div>
                </div>
            }
        >
            <Head title="Supervisor Dashboard" />

            {/* First-visit onboarding modal */}
            {showIntroModal && (
                <MindfulnessIntroModal onClose={() => setShowIntroModal(false)} />
            )}

            <div className="py-4 sm:py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-3 sm:mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">De cliënten</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Bekijk voortgang, beheer favorieten en doe oefeningen samen met jouw cliënten.
                        </p>
                    </div>

                    {/* Persistent collapsible info block — always accessible after modal */}
                    <MindfulnessInfoBlock />

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                            {error}
                        </div>
                    )}

                    {/* TeamList receives all data via props */}
                    <TeamList
                        clients={clients}
                        loading={loading}
                        selectedClient={selectedClient}
                        onSelectClient={handleSelectClient}
                        onAddSuccess={handleAddSuccess}
                    />

                    {selectedClient && (
                        <div id="client-detail-section" className="mt-8">
                            <ClientDetail
                                key={selectedClient.id}
                                client={selectedClient}
                                onClose={() => setSelectedClient(null)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
