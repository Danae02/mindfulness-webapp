import { useState } from "react";

export default function ExerciseEditor({ exercise, onSave, onCancel }) {
    const [editedExercise, setEditedExercise] = useState({ ...exercise });

    const handleSave = (e) => {
        e.preventDefault();
        onSave(editedExercise);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-2xl">
                <h2 className="text-lg font-bold mb-4">Bewerk Oefening</h2>
                <form onSubmit={handleSave}>
                    {/* Naam */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Naam</label>
                        <input
                            type="text"
                            value={editedExercise.exercise_name}
                            onChange={(e) =>
                                setEditedExercise({ ...editedExercise, exercise_name: e.target.value })
                            }
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Vraag */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Vraag</label>
                        <input
                            type="text"
                            value={editedExercise.form_question}
                            onChange={(e) =>
                                setEditedExercise({ ...editedExercise, form_question: e.target.value })
                            }
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Antwoorden */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Antwoorden</label>
                        {editedExercise.form_answers.map((answer, index) => (
                            <input
                                key={index}
                                type="text"
                                value={answer}
                                onChange={(e) => {
                                    const updatedAnswers = [...editedExercise.form_answers];
                                    updatedAnswers[index] = e.target.value;
                                    setEditedExercise({ ...editedExercise, form_answers: updatedAnswers });
                                }}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder={`Antwoord ${index + 1}`}
                                required
                            />
                        ))}
                    </div>

                    {/* Audio */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Nieuwe audio (optioneel)</label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) =>
                                setEditedExercise({ ...editedExercise, newFile: e.target.files[0] })
                            }
                            className="mt-1 block w-full text-sm text-gray-500"
                        />
                    </div>

                    {/* Actieknoppen */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700"
                        >
                            Annuleren
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700"
                        >
                            Opslaan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
