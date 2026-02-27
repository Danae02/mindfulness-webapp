import ExerciseCard from "./ExerciseCard";
import ExerciseEditor from "./ExerciseEditor";
import { useState } from "react";

export default function CourseModal({ course, onClose, onEditCourseName, onDeleteCourse, onEditExercise }) {
    const [editingExercise, setEditingExercise] = useState(null);
    const [newName, setNewName] = useState(course.course_name);
    const [isEditingName, setIsEditingName] = useState(false);

    const handleSaveExercise = (updatedExercise) => {
        onEditExercise(updatedExercise);
        setEditingExercise(null);
    };
    const handleSaveName = () => {
        onEditCourseName(newName);
        setIsEditingName(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-3xl">
                {isEditingName ? (
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
                                onClick={handleSaveName}
                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded shadow hover:bg-green-700"
                            >
                                Opslaan
                            </button>
                            <button
                                onClick={() => setIsEditingName(false)}
                                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700"
                            >
                                Annuleren
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{course.course_name}</h2>
                        <button
                            onClick={() => setIsEditingName(true)}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded shadow hover:bg-blue-700"
                        >
                            Bewerken
                        </button>
                    </div>
                )}
                <h3 className="text-lg font-semibold mb-2">Oefeningen</h3>
                <div className="space-y-2">
                    {course.exercises.map((exercise) => (
                        <ExerciseCard
                            key={exercise.id}
                            exercise={exercise}
                            onEdit={() => setEditingExercise(exercise)}
                        />
                    ))}
                </div>

                {editingExercise && (
                    <ExerciseEditor
                        exercise={editingExercise}
                        onSave={handleSaveExercise}
                        onCancel={() => setEditingExercise(null)}
                    />
                )}

                <div className="flex justify-end space-x-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700">
                        Sluiten
                    </button>
                    <button
                        onClick={() => onDeleteCourse(course.id)}
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded shadow hover:bg-gray-700"
                    >
                        Verwijderen
                    </button>
                </div>
            </div>
        </div>
    );
}
