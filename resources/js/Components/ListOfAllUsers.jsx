import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from '@/Components/SearchBar.jsx';
import FilterSwitch from '@/Components/FilterSwitch.jsx';
import UserDetailModal from "@/Components/UserDetailModal.jsx";

export default function ListOfAllUsers() {
    const [users, setUsers] = useState([]); // State to hold user data
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [filtered, setFiltered] = useState(false); // Filter state
    const [selectedUser, setSelectedUser] = useState(null); // Selected user for modal
    const [showModal, setShowModal] = useState(false); // Modal visibility
    const [searchTerm, setSearchTerm] = useState(''); // Search term for name filtering

    const roleMapping = {
        1: 'Admin',
        2: 'Gebruiker',
        3: 'Begeleider',
        4: 'Onderzoeker',
    };

    // Fetch users from backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(route('users.index'));
                setUsers(response.data);
            } catch (err) {
                setError('Failed to fetch users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Filter users based on the "is_reviewed" flag
    const filteredUsers = filtered
        ? users.filter(user => !user.is_reviewed)
        : users;

    // Filter users based on the search term (name)
    const searchedUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle row click to open user modal
    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true); // Open modal
    };

    // Close the modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    // Loading or error states
    if (loading) return <div>Loading users...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            {/* Search and Filter Buttons container */}
            <div className="flex items-center mb-4 space-x-4">
                <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} catTerm="naam"/>

                <FilterSwitch filtered={filtered} onToggle={() => setFiltered(!filtered)} />

            </div>

            {/* Table to display users */}
            <table className="table-auto border-collapse border border-gray-400 w-full">
                <thead>
                <tr>
                    <th className="border border-gray-300 px-4 py-2">ID</th>
                    <th className="border border-gray-300 px-4 py-2">Naam</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                    <th className="border border-gray-300 px-4 py-2">Role</th>
                </tr>
                </thead>
                <tbody>
                {searchedUsers.map((user) => (
                    <tr
                        key={user.id}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleRowClick(user)} // Open user modal on row click
                    >
                        <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                        <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                        <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                        <td className="border border-gray-300 px-4 py-2">
                            {roleMapping[user.role_id] || 'Unknown'}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* UserDetailModal */}
            {showModal && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    closeModal={closeModal}
                    setUsers={setUsers}
                />
            )}
        </div>
    );
}
