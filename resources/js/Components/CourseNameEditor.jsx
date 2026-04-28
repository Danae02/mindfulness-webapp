// CourseNameEditor.jsx
import { useState } from "react";

export default function CourseNameEditor({ courseName, onSave }) {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName]     = useState(courseName);

    const handleSave = () => {
        onSave(newName);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="mb-4">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                <div className="flex space-x-4 mt-2">
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700"
                    >
                        Opslaan
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700"
                    >
                        Annuleren
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{courseName}</h2>
            <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700"
            >
                Bewerken
            </button>
        </div>
    );
}
