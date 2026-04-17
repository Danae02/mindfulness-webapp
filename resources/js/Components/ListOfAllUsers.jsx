import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SearchBar from '@/Components/SearchBar.jsx';
import FilterSwitch from '@/Components/FilterSwitch.jsx';
import UserDetailModal from "@/Components/UserDetailModal.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

export default function ListOfAllUsers() {
    const [users, setUsers] = useState([]); // State om gebruikersdata op te slaan
    const [loading, setLoading] = useState(true); // Laadstate
    const [error, setError] = useState(null); // Foutstate
    const [filtered, setFiltered] = useState(false); // Filterstate
    const [selectedUser, setSelectedUser] = useState(null); // Geselecteerde gebruiker voor modal
    const [showModal, setShowModal] = useState(false); // Modal zichtbaarheid
    const [searchTerm, setSearchTerm] = useState(''); // Zoekterm voor naam filtering

    const roleMapping = {
        1: 'Admin',
        2: 'Gebruiker',
        3: 'Begeleider',
        4: 'Onderzoeker',
    };

    // colors for different roles
    const roleColors = {
        1: 'bg-red-100 text-red-800',
        2: 'bg-green-100 text-green-800',
        3: 'bg-blue-100 text-blue-800',
        4: 'bg-purple-100 text-purple-800',
    };

    // fetch users from backend
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(route('users.index'));
                setUsers(response.data);
            } catch (err) {
                setError('Fout bij het ophalen van gebruikers.');
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

            {/* Better table to displat users */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Naam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rol
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {searchedUsers.map((user) => (
                        <tr
                            key={user.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                            onClick={() => handleRowClick(user)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role_id] || 'bg-gray-100 text-gray-800'}`}>
                                        {roleMapping[user.role_id] || 'Onbekend'}
                                    </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

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
