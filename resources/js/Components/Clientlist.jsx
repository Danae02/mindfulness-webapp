import { useRef } from 'react';
import LoadingIndicator from "@/Components/LoadingIndicator";
import AddClientForm from "@/Components/AddClientForm";

// Helpers

function getInitials(name) {
    return (name ?? '?').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

// Iconen
const IconUsers = (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// Sub-componenten
function EmptyState({ icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400" role="status" aria-live="polite">
            <span className="mb-3" aria-hidden="true">{icon}</span>
            <p className="text-sm">{message}</p>
        </div>
    );
}

// ClientList
export default function ClientList({
                                       clients,
                                       loading,
                                       search,
                                       onSearchChange,
                                       showAddForm,
                                       onToggleAddForm,
                                       onAddSuccess,
                                       selectedClient,
                                       onSelectClient,
                                   }) {
    const addBtnRef = useRef(null);

    const handleAddSuccess = () => {
        onAddSuccess();
        setTimeout(() => addBtnRef.current?.focus(), 100);
    };

    return (
        <section
            aria-labelledby="client-list-heading"
            className="bg-white rounded-xl border border-gray-200"
            style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-5 border-b border-gray-100">
                <h2 id="client-list-heading" className="font-semibold text-gray-800 flex-1">
                    Cliëntoverzicht
                    {!loading && (
                        <span className="ml-2 text-sm font-normal text-gray-400">
                            ({clients.length})
                        </span>
                    )}
                </h2>

                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="search"
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Zoek cliënt…"
                        aria-label="Zoek cliënt op naam of e-mail"
                        className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:border-transparent w-48"
                    />
                </div>

                <button
                    ref={addBtnRef}
                    onClick={onToggleAddForm}
                    aria-expanded={showAddForm}
                    aria-controls="add-client-form-region"
                    className="shrink-0 flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
                    style={{ backgroundColor: '#7B5EA7' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6a4e8e'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7B5EA7'}
                >
                    {showAddForm
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    }
                    {showAddForm ? 'Annuleren' : 'Cliënt toevoegen'}
                </button>
            </div>

            {showAddForm && (
                <div id="add-client-form-region" className="px-6 pb-6 border-b border-gray-100">
                    <AddClientForm
                        onSuccess={handleAddSuccess}
                        onCancel={onToggleAddForm}
                    />
                </div>
            )}

            <div className="px-6 py-4">
                {loading ? (
                    <LoadingIndicator message="Cliënten laden…" />
                ) : clients.length === 0 ? (
                    <EmptyState
                        icon={IconUsers}
                        message={search ? 'Geen cliënten gevonden.' : 'Je hebt nog geen cliënten.'}
                    />
                ) : (
                    <ul aria-label="Lijst van cliënten" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {clients.map((client) => {
                            const isSelected = selectedClient?.id === client.id;
                            return (
                                <li key={client.id}>
                                    <button
                                        onClick={() => onSelectClient(client)}
                                        aria-pressed={isSelected}
                                        aria-label={`Bekijk gegevens van ${client.name}`}
                                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:ring-offset-1 ${
                                            isSelected
                                                ? 'border-[#7B5EA7] bg-[#F5F0FA]'
                                                : 'border-gray-200 bg-white hover:border-[#D4C5E8] hover:bg-[#F5F0FA]'
                                        }`}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                                            style={{ backgroundColor: isSelected ? '#7B5EA7' : '#9B8EC4' }}
                                            aria-hidden="true"
                                        >
                                            {getInitials(client.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${isSelected ? 'text-[#7B5EA7]' : 'text-gray-800'}`}>
                                                {client.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{client.email}</p>
                                        </div>
                                        {isSelected && (
                                            <svg className="shrink-0 w-4 h-4 text-[#7B5EA7]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
