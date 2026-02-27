import React from 'react';

export default function FilterButton({ onClick, filtered }) {
    return (
        <button
            onClick={onClick}
            className={`mb-4 px-4 py-2 text-white ${filtered ? 'bg-blue-500' : 'bg-gray-500'} hover:bg-blue-700`}
        >
            {filtered ? 'Laat alle gebruikers zien' : 'Laat alleen onbeoordeelde gebruikers zien'}
        </button>
    );
}
