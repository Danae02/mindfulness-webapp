import React, { useState } from 'react';
import axios from 'axios';

export default function UserDetailModal({ user, closeModal, setUsers }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableUser, setEditableUser] = useState({ ...user });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const roleMapping = {
        1: 'Admin',
        2: 'Gebruiker',
        3: 'Begeleider',
        4: 'Onderzoeker',
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditableUser((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const response = await axios.put(route('users.update', { id: editableUser.id }), editableUser);
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === editableUser.id ? response.data.user : u))
            );
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating user:', err);
            setError('Opslaan mislukt. Probeer het opnieuw.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={closeModal}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Paarse header */}
                <div className="px-6 py-5" style={{ backgroundColor: '#7B5EA7' }}>
                    <h2 id="modal-title" className="text-xl font-bold text-white">
                        {!isEditing ? 'Gebruikersgegevens' : 'Gebruiker bewerken'}
                    </h2>
                </div>

                <div className="p-6">
                    {!isEditing ? (
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Naam</p>
                                <p className="text-base text-gray-900 mt-1">{user.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mailadres</p>
                                <p className="text-base text-gray-900 mt-1">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</p>
                                <p className="text-base text-gray-900 mt-1">{roleMapping[user.role_id] || 'Onbekend'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                                <p className="text-base text-gray-900 mt-1">
                                    {user.is_reviewed ? 'Beoordeeld' : 'Nog niet beoordeeld'}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-500 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Sluiten
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7]"
                                    style={{ backgroundColor: '#7B5EA7' }}
                                >
                                    Bewerken
                                </button>
                            </div>
                        </div>
                    ) : (
                        // ===== BEWERK MODUS =====
                        <form className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            {/* Naam veld */}
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Naam <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="edit-name"
                                    type="text"
                                    name="name"
                                    value={editableUser.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:border-transparent"
                                    required
                                    aria-required="true"
                                />
                            </div>

                            {/* E-mail veld */}
                            <div>
                                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                                    E-mailadres <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="edit-email"
                                    type="email"
                                    name="email"
                                    value={editableUser.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:border-transparent"
                                    required
                                    aria-required="true"
                                />
                            </div>

                            {/* Rol selectie */}
                            <div>
                                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                                    Rol
                                </label>
                                <select
                                    id="edit-role"
                                    name="role_id"
                                    value={editableUser.role_id || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7B5EA7] focus:border-transparent bg-white"
                                >
                                    <option value="">Selecteer een rol</option>
                                    <option value="1">Admin</option>
                                    <option value="2">Gebruiker</option>
                                    <option value="3">Begeleider</option>
                                    <option value="4">Onderzoeker</option>
                                </select>
                            </div>

                            {/* Reviewed checkbox */}
                            <div className="flex items-center gap-2">
                                <input
                                    id="edit-reviewed"
                                    type="checkbox"
                                    name="is_reviewed"
                                    checked={editableUser.is_reviewed}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded border-gray-400 text-[#7B5EA7] focus:ring-[#7B5EA7]"
                                />
                                <label htmlFor="edit-reviewed" className="text-sm text-gray-700">
                                    Gemarkeerd als beoordeeld
                                </label>
                            </div>

                            {/* Knoppen */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-500 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Annuleren
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveChanges}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7B5EA7] disabled:opacity-50"
                                    style={{ backgroundColor: '#7B5EA7' }}
                                >
                                    {isSaving ? 'Bezig met opslaan...' : 'Opslaan'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
