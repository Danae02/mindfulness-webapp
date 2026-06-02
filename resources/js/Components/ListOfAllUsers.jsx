import React, { useState } from 'react';
import SearchBar from '@/Components/SearchBar.jsx';
import FilterSwitch from '@/Components/FilterSwitch.jsx';
import UserDetailModal from "@/Components/UserDetailModal.jsx";
import LoadingIndicator from "@/Components/LoadingIndicator.jsx";

export default function ListOfAllUsers({
                                           users = [],
                                           loading = false,
                                           error = null,
                                           filtered = false,
                                           onFilterChange = () => {},
                                           searchTerm = '',
                                           onSearchChange = () => {},
                                           onUsersRefresh = () => {},
                                       }) {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const roleMapping = {
        1: 'Admin',
        2: 'Gebruiker',
        3: 'Begeleider',
        4: 'Onderzoeker',
    };

    const roleColors = {
        1: 'bg-red-100 text-red-800',
        2: 'bg-green-100 text-green-800',
        3: 'bg-blue-100 text-blue-800',
        4: 'bg-purple-100 text-purple-800',
    };

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
    };

    if (loading) return <LoadingIndicator message="Gebruikers laden..." />;
    if (error) return <div className="text-red-600 p-4">{error}</div>;

    // Filter users based on the "is_reviewed" flag
    const filteredUsers = filtered
        ? users.filter(user => !user.is_reviewed)
        : users;

    // Filter users based on the search term (name)
    const searchedUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Search and Filter Buttons container */}
            <div className="flex flex-col sm:flex-row sm:items-end mb-4 gap-3 sm:gap-6">
                <div className="w-full sm:w-auto">
                    <SearchBar searchTerm={searchTerm} onSearch={onSearchChange} catTerm="naam"/>
                </div>
                <FilterSwitch filtered={filtered} onToggle={() => onFilterChange(!filtered)} />
            </div>

            {/* Better table to display users */}
            <div
                className="overflow-x-auto rounded-xl border border-gray-500 shadow-sm"
                tabIndex={0}
                role="region"
                aria-label="Gebruikerslijst"
            >
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-200 border-b-2 border-gray-800">
                    <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                            Naam
                        </th>
                        <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
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
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.id}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {user.name}
                            </td>
                            <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {user.email}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ring-1 ring-black ${roleColors[user.role_id] || 'bg-gray-100 text-gray-800'}`}>
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
                    setUsers={(updatedUsers) => {
                        onUsersRefresh();
                    }}
                />
            )}
        </div>
    );
}
