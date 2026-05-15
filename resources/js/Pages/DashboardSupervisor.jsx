import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout.jsx";
import { Head } from "@inertiajs/react";
import AccessibilityButton from "@/Components/AccessibilityButton";
import ClientList   from "@/Components/ClientList";
import ClientDetail from "@/Components/ClientDetail";

export default function DashboardSupervisor() {
    const [clients,        setClients]        = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientsLoading, setClientsLoading] = useState(true);
    const [showAddForm,    setShowAddForm]    = useState(false);
    const [search,         setSearch]         = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setClientsLoading(true);
        try {
            const response = await axios.get(route('users.get.team'));
            setClients(response.data);
        } catch (error) {
            console.error('Fout bij ophalen cliënten:', error);
        } finally {
            setClientsLoading(false);
        }
    };

    const handleAddSuccess = () => {
        setShowAddForm(false);
        fetchClients();
    };

    const handleSelectClient = (client) => {
        setSelectedClient(client);
        setTimeout(() => {
            document.getElementById('client-detail-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

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

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">De cliënten</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Bekijk voortgang, beheer favorieten en doe oefeningen samen met jouw cliënten.
                        </p>
                    </div>

                    <ClientList
                        clients={filteredClients}
                        loading={clientsLoading}
                        search={search}
                        onSearchChange={setSearch}
                        showAddForm={showAddForm}
                        onToggleAddForm={() => setShowAddForm(v => !v)}
                        onAddSuccess={handleAddSuccess}
                        selectedClient={selectedClient}
                        onSelectClient={handleSelectClient}
                    />

                    {selectedClient && (
                        <div id="client-detail-section">
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
