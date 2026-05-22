import { useState } from "react";
import RegisterUserAsSupervisor from "@/Components/RegisterUserAsSupervisor.jsx";

export default function TeamList({
                                     clients = [],
                                     loading = false,
                                     selectedClient = null,
                                     onSelectClient = () => {},
                                     onAddSuccess = () => {},
                                 }) {
    const [showModal, setShowModal] = useState(false);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-gray-600 text-sm">Teamleden laden...</p>
            </div>
        );
    }

    const getInitial = (name) => name?.charAt(0).toUpperCase() ?? '?';

    return (
        <div className="p-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold" style={{ color: '#4A2B7A' }}>
                    Mijn cliënten dashboard
                </h1>
                <p className="text-sm text-gray-700 mt-1">
                    Je kan op dit moment{' '}
                    <span className="font-semibold text-gray-900">{clients.length}</span>{' '}
                    {clients.length === 1 ? 'persoon' : 'mensen'} begeleiden.
                    Klik op een naam om hun voortgang te bekijken of om een oefening
                    voor ze te starten.
                </p>
            </div>

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

                {clients.length > 0 ? (
                    <ul className="space-y-3">
                        {clients.map((member) => (
                            <li key={member.id}>
                                <button
                                    onClick={() => onSelectClient(member)}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                                    style={{
                                        backgroundColor: selectedClient?.id === member.id ? '#E2D5F5' : '#EDE5F8',
                                        border: '1.5px solid #C9B8E8',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedClient?.id !== member.id) {
                                            e.currentTarget.style.backgroundColor = '#E2D5F5';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedClient?.id !== member.id) {
                                            e.currentTarget.style.backgroundColor = '#EDE5F8';
                                        }
                                    }}
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
                    <p className="text-sm text-gray-600 text-center py-4">
                        Er zijn nog geen cliënten gevonden.
                    </p>
                )}

                <button
                    onClick={() => setShowModal(true)}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-2"
                    style={{
                        border: '2px dashed #C9B8E8',
                        backgroundColor: 'transparent',
                        color: '#7B5EA7',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F0E8FC';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    + Cliënt toevoegen
                </button>
            </div>

            {/* Modal: gebruiker toevoegen */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-client-modal-title"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="add-client-modal-title" className="text-lg font-bold mb-4 text-center" style={{ color: '#3D2A6E' }}>
                            Cliënt registreren
                        </h2>

                        <div
                            className="mb-6 p-4 rounded-lg"
                            style={{
                                backgroundColor: '#F5F0FF',
                                border: '3px solid #4A2B7A'
                            }}
                        >
                            <p className="text-sm" style={{ color: '#1F0F3D' }}>
                                <span className="font-semibold">Let op:</span> Als je op deze manier een account aanmaakt, kan de gebruiker <span className="font-semibold">niet zelfstandig inloggen</span>. Hiervoor is een e-mailadres nodig.
                            </p>
                            <p className="text-sm mt-2" style={{ color: '#1F0F3D' }}>
                                Als de gebruiker <span className="font-semibold">zelfstandig wil kunnen inloggen</span>, maak dan samen via de inlog pagina een account aan. Op die manier kan je ook nog samen oefeningen doen.
                            </p>
                        </div>

                        <RegisterUserAsSupervisor
                            onSuccess={() => {
                                setShowModal(false);
                                onAddSuccess();
                            }}
                        />
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setShowModal(false)}
                                className="py-2 px-6 rounded-lg text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]"
                                style={{ backgroundColor: '#7B5EA7' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#6a4e8e';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#7B5EA7';
                                }}
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
