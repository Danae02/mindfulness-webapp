import React, { useState } from 'react';
import axios from 'axios';

export default function UserDetailModal({ user, closeModal, setUsers }) {
    const [isEditing, setIsEditing] = useState(false); // Controleren of we in de edit-modus zijn
    const [editableUser, setEditableUser] = useState({ ...user });
    const [isSaving, setIsSaving] = useState(false); // Laadstatus voor het opslaan
    const [error, setError] = useState(null); // Foutmeldingen opslaan

    const roleMapping = {
        1: 'Admin',
        2: 'Gebruiker',
        3: 'Begeleider',
        4: 'Onderzoeker',
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const response = await axios.put(route('users.update', { id: editableUser.id }), editableUser);

            console.log(response.data)

            setUsers((prevUsers) =>
                prevUsers.map((u) => (u.id === editableUser.id ? response.data.user : u))
            );
            setIsEditing(false); // Exit edit mode
        } catch (err) {
            console.error('Error updating user:', err);
            setError('Failed to save changes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                {!isEditing ? (
                    <>
                        {/* Standaard weergave van de modal */}
                        <h2 className="text-xl font-bold mb-4">User Details</h2>
                        <p><strong>Naam:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Rol:</strong> {roleMapping[user.role_id] || 'Unknown'}</p>
                        <p>
                            <strong>Reviewed:</strong>{' '}
                            {user.is_reviewed ? 'Yes' : 'No'}
                        </p>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={closeModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setIsEditing(true)} // Ga naar edit-modus
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                Edit
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Bewerken-weergave van de modal */}
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                        <form>
                            <div className="mb-4">
                                <label className="block text-gray-700">Name:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editableUser.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editableUser.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Role:</label>
                                <select
                                    name="role_id"
                                    value={editableUser.role_id || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded"
                                >
                                    <option value="">Selecteer de goede rol:</option>
                                    <option value="1">Admin</option>
                                    <option value="2">Gebruiker</option>
                                    <option value="3">Begeleider</option>
                                    <option value="4">Onderzoeker</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Reviewed:</label>
                                <input
                                    type="checkbox"
                                    name="is_reviewed"
                                    checked={editableUser.is_reviewed}
                                    onChange={(e) =>
                                        setEditableUser((prev) => ({
                                            ...prev,
                                            is_reviewed: e.target.checked,
                                        }))
                                    }
                                    className="mr-2"
                                />
                                Mark as reviewed
                            </div>
                        </form>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsEditing(false)} // Terug naar standaardweergave
                                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className={`bg-green-500 text-white px-4 py-2 rounded ${
                                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
