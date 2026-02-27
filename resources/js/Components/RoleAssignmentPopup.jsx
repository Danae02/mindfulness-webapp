import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RoleAssignmentPopup({ user, closePopup, setUsers }) {
    const [roleId, setRoleId] = useState(user.role_id); // Default role is user's current role
    const [isReviewed, setIsReviewed] = useState(user.is_reviewed); // Default review status is user's current status
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Update user role and review status in the backend
            const response = await axios.put(route('users.update', user.id), {
                role_id: roleId,
                is_reviewed: isReviewed,
            });

            // Update the users list after the change
            setUsers((prevUsers) => prevUsers.map(u => u.id === user.id ? response.data : u));

            closePopup(); // Close the pop-up
        } catch (error) {
            console.error('Failed to update user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">Assign Role to {user.name}</h2>

                <div className="mb-4">
                    <label className="block mb-2">Role</label>
                    <select
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded"
                    >
                        <option value="1">Admin</option>
                        <option value="2">Viewer</option>
                        <option value="3">Supervisor</option>
                        <option value="4">Researcher</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={isReviewed}
                            onChange={(e) => setIsReviewed(e.target.checked)}
                            className="mr-2"
                        />
                        Mark as Reviewed
                    </label>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={closePopup}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
